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
