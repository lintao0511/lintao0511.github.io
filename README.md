# 个人主页 · Lin Tao

深色科技风的个人主页，**手机和电脑同一账号登录**，内容存在 Supabase，多端实时同步。

- 前端：纯静态（HTML + CSS + 原生 JS），无构建步骤
- 部署：GitHub Pages
- 后端：Supabase Auth（邮箱密码登录）+ Postgres（存放个人资料）

---

## 部署步骤

### ① 建 Supabase 项目

1. 打开 <https://supabase.com> → 注册（免费）
2. `New project` → 记下 **Database password**（不是邮箱密码）
3. 选一个离你近的 Region，`Create new project`
4. 等 1~2 分钟 provisioning 完成

### ② 建表

左侧菜单 `SQL Editor` → `New query` → 粘贴 [`supabase/schema.sql`](supabase/schema.sql) 全部内容 → `Run`

### ③ 拿到 API 密钥

左侧菜单 `Project Settings` → `API`（或 `Settings → API`），复制两个值：

| 字段 | 说明 |
|---|---|
| `Project URL` | 形如 `https://abcdefgh.supabase.co` |
| `anon public` key | 以 `eyJ` 开头的那串 |

### ④ 填进站点配置

编辑 [`assets/config.js`](assets/config.js) 顶部两行：

```js
supabaseUrl:     'https://abcdefgh.supabase.co',
supabaseAnonKey: 'eyJhbGciOi...',
```

### ⑤ 开启邮箱登录

`Authentication` → `Providers` → `Email`：

- 打开 **Enable Email provider**
- 想免验证直接登录 → 把 **Confirm email** 关掉
- 想只让自己能注册 → `Authentication → Sign In / Providers → Email` 里关闭 **Allow new users to sign up**
  （更稳的做法：注册完账号后，在 `Authentication → Users` 里删掉不再需要的用户）

### ⑥ 推到 GitHub Pages

```bash
cd personal-site
git add -A && git commit -m "init: personal site"
gh repo create lintao0511.github.io --public --source=. --push
```

然后 `Settings` → `Pages` → `Source` 选 **Deploy from a branch** → 分支 `main`、目录 `/ (root)` → Save。

大约 1 分钟上线，地址：**https://lintao0511.github.io**

> 如果仓库已经是私有的，GitHub 免费版不支持私有仓库的 Pages，需要把仓库改成公开
> （`gh repo edit lintao0511.github.io --visibility public`）。仓库里的 HTML/JS 公开没关系，
> 个人资料在 Supabase 里，受 RLS 保护，只有登录后才能读。

### ⑦ 建你自己的账号

打开网站 → 点「没有账号？去注册」→ 用你的邮箱注册 → 登录。

首次登录会自动在 `site_profile` 表写入一行初始内容。之后你就能在
`Supabase → Table Editor → site_profile` 里直接改文字，不用碰代码。

---

## 改内容

**最省事**：Supabase 控制台 `Table Editor` → `site_profile` → 改 `display_name` / `tagline` / `bio` / `skills` / `projects` / `links` → 保存。刷新网站即生效。

**结构**见 [`supabase/schema.sql`](supabase/schema.sql) 末尾的说明。

**改样式**：`assets/style.css` 顶部 `:root` 里是全部配色变量：

```css
--accent:   #6ea8ff;   /* 主色 */
--accent-2: #a855f7;   /* 渐变副色 */
--bg:       #070a12;
```

---

## 文件结构

```
personal-site/
├── index.html              登录页 + 主页（单页）
├── assets/
│   ├── style.css           全部样式（含响应式）
│   ├── app.js              登录逻辑 + 内容渲染
│   └── config.js           ← 填 Supabase URL / anon key
├── supabase/
│   └── schema.sql          建表 + RLS 策略
└── README.md
```

## 响应式

| 断点 | 布局 |
|---|---|
| > 860px | 导航展开，头像与文字左右并排，卡片多列 |
| ≤ 860px | 导航收起，头像居中，卡片双列 |
| ≤ 480px | 全部单列，状态徽章隐藏 |
