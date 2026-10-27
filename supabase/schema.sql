-- ════════════════════════════════════════════════════════════
--  林涛 · 个人主页 —— Supabase 数据库初始化
--  用法：Supabase 控制台 → SQL Editor → 新建查询 → 粘贴 → Run
-- ════════════════════════════════════════════════════════════

-- 1) 内容表（单行，owner_email 唯一）
create table if not exists public.site_profile (
  id           uuid primary key default gen_random_uuid(),
  owner_email  text unique not null,
  display_name text,
  tagline      text,
  bio          text,
  avatar_url   text,
  location     text,
  skills       jsonb not null default '[]'::jsonb,
  projects     jsonb not null default '[]'::jsonb,
  links        jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now()
);

-- 2) 开启行级安全
alter table public.site_profile enable row level security;

-- 3) 只允许登录用户读自己的那一行
drop policy if exists "read own profile" on public.site_profile;
create policy "read own profile" on public.site_profile
  for select to authenticated
  using (lower(auth.jwt() ->> 'email') = lower(owner_email));

-- 4) 首次登录时由前端写入初始内容
drop policy if exists "insert own profile" on public.site_profile;
create policy "insert own profile" on public.site_profile
  for insert to authenticated
  with check (lower(auth.jwt() ->> 'email') = lower(owner_email));

-- 5) 只允许改自己的那一行
drop policy if exists "update own profile" on public.site_profile;
create policy "update own profile" on public.site_profile
  for update to authenticated
  using (lower(auth.jwt() ->> 'email') = lower(owner_email))
  with check (lower(auth.jwt() ->> 'email') = lower(owner_email));

-- 6) 每次更新自动刷新时间戳
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists site_profile_touch on public.site_profile;
create trigger site_profile_touch
  before update on public.site_profile
  for each row execute function public.touch_updated_at();

-- ════════════════════════════════════════════════════════════
--  可选：手动预置一行（前端首次登录时也会自动创建，二选一即可）
--  把下面的邮箱换成你自己的
-- ════════════════════════════════════════════════════════════
-- insert into public.site_profile (owner_email, display_name, tagline)
-- values ('your@email.com', 'Lin Tao', '机器人设计 · 嵌入式硬件 · 参数化 CAD')
-- on conflict (owner_email) do nothing;


-- ════════════════════════════════════════════════════════════
--  数据结构说明（编辑内容时对照）
-- ════════════════════════════════════════════════════════════
-- skills   jsonb 数组：
--   [{"name":"URDF / SDF / SRDF","icon":"⚙"}]
--   icon 可省略
--
-- projects jsonb 数组：
--   [{"title":"项目名",
--     "desc":"一段描述",
--     "tags":["标签1","标签2"],
--     "links":[{"label":"源码","href":"https://..."}]}]
--
-- links    jsonb 数组：
--   [{"label":"GitHub","value":"lintao0511",
--     "href":"https://github.com/lintao0511","icon":"⌨"}]
