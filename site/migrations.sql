-- ============================================
-- 1. comments (챕터 하단 댓글)
-- ============================================
create table comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chapter_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  user_avatar text,
  content text not null
);

alter table comments enable row level security;

create policy "Anyone can read comments"
  on comments for select
  using (true);

create policy "Authenticated users can insert"
  on comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on comments for delete
  using (auth.uid() = user_id);

-- ============================================
-- 2. inline_comments (텍스트 드래그 인라인 댓글)
-- ============================================
create table inline_comments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  chapter_id text not null,
  selected_text text not null,
  text_prefix text default '',
  text_suffix text default '',
  user_id uuid references auth.users(id) on delete cascade,
  user_name text,
  user_avatar text,
  content text not null
);

alter table inline_comments enable row level security;

create policy "Anyone can read inline comments"
  on inline_comments for select
  using (true);

create policy "Authenticated users can insert inline"
  on inline_comments for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own inline comments"
  on inline_comments for delete
  using (auth.uid() = user_id);

-- ============================================
-- 3. books (전자책 메타데이터)
-- ============================================
create table books (
  id text primary key,
  title text not null,
  description text default '',
  author text default 'SPEC 디자인팀',
  cover_url text default '',
  category text not null check (category in ('ai-basics','vibe-coding','vibe-design','vibe-marketing')),
  is_free boolean default true,
  is_published boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table books enable row level security;
create policy "Anyone can read books" on books for select using (true);

-- ============================================
-- 4. reading_progress (읽기 진행률)
-- ============================================
create table reading_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id text references books(id) on delete cascade not null,
  last_chapter_id text default '',
  progress_percent int default 0 check (progress_percent between 0 and 100),
  updated_at timestamptz default now(),
  unique(user_id, book_id)
);

alter table reading_progress enable row level security;
create policy "Users read own progress" on reading_progress for select using (auth.uid() = user_id);
create policy "Users upsert own progress" on reading_progress for insert with check (auth.uid() = user_id);
create policy "Users update own progress" on reading_progress for update using (auth.uid() = user_id);

-- ============================================
-- 5. bookmarks (찜 목록)
-- ============================================
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id text references books(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, book_id)
);

alter table bookmarks enable row level security;
create policy "Users read own bookmarks" on bookmarks for select using (auth.uid() = user_id);
create policy "Users insert own bookmarks" on bookmarks for insert with check (auth.uid() = user_id);
create policy "Users delete own bookmarks" on bookmarks for delete using (auth.uid() = user_id);

-- ============================================
-- 6. 시드 데이터 (바이브코딩 전자책 4권)
-- ============================================
insert into books (id, title, description, author, cover_url, category, sort_order) values
  ('vibe-coding-claude', 'Claude Code 입문', 'AI 코딩 에이전트 Claude Code의 설치부터 실전 활용까지', 'SPEC 디자인팀', '', 'vibe-coding', 1),
  ('vibe-coding-prd', 'PRD 작성법', 'AI에게 정확한 지시를 내리는 기획 문서 작성법', 'SPEC 디자인팀', '', 'vibe-coding', 2),
  ('vibe-coding-deploy', 'GitHub + Vercel 배포', '코드를 세상에 공개하는 배포의 모든 것', 'SPEC 디자인팀', '', 'vibe-coding', 3),
  ('vibe-coding-supabase', 'Supabase 백엔드 입문', '서버 없이 백엔드를 구축하는 Supabase 가이드', 'SPEC 디자인팀', '', 'vibe-coding', 4)
on conflict (id) do nothing;
