/* ════════════════════════════════════════════════════════════
   站点配置 —— 需要你填两处
   1) supabaseUrl     : Supabase 控制台 → Project Settings → API → Project URL
   2) supabaseAnonKey : Supabase 控制台 → Project Settings → API → anon public key
   填完把这两个文件推到 GitHub，网站即可登录。
   ════════════════════════════════════════════════════════════ */
window.SITE_CONFIG = {
  supabaseUrl:     'https://YOUR-PROJECT-REF.supabase.co',
  supabaseAnonKey: 'YOUR-ANON-PUBLIC-KEY',

  /* 数据库没有内容时的兜底展示（数据库配好后会被覆盖） */
  defaultProfile: {
    display_name: 'Lin Tao',
    tagline: '机器人设计 · 嵌入式硬件 · 参数化 CAD',
    bio: '喜欢把想法变成能跑起来的东西：从 PCB 到整机结构，从运动学模型到仿真验证。日常用 AI 工具链把重复的工程活儿交出去，把时间留给真正需要判断的部分。',
    avatar_url: '',
    location: '中国',
    skills: [
      { name: 'CAD / build123d', icon: '◧' },
      { name: 'URDF / SDF / SRDF', icon: '⚙' },
      { name: 'ROS 2 / MoveIt', icon: '◆' },
      { name: 'PCB 设计 / EasyEDA', icon: '▤' },
      { name: 'Ghidra / IDA / Hopper', icon: '◈' },
      { name: 'Python / Node.js', icon: '◉' },
      { name: 'TypeScript', icon: '◐' },
      { name: 'Claude Code / MCP', icon: '◈' },
      { name: '机械设计与加工', icon: '⬢' },
      { name: '嵌入式 / 固件', icon: '▣' }
    ],
    projects: [
      {
        title: '机器人描述工具链',
        desc: 'URDF / SDF / SRDF 三件套生成与校验，从 Python 源码生成描述文件，生成时自动检查坐标系、关节轴、惯量与网格引用。',
        tags: ['URDF', 'SRDF', 'SDF', 'Python'],
        links: []
      },
      {
        title: '参数化 CAD 与装配',
        desc: '基于 build123d 的 STEP 优先流程：自然语言需求转 CAD brief，源级装配配合基准，几何事实与配合量校验。',
        tags: ['build123d', 'STEP', '装配'],
        links: []
      },
      {
        title: 'AI 工具链实践',
        desc: '把 Claude Code 当工程系统用：记忆库、技能体系、MCP 工具接入，用自动化脚本给每次改动加上可验证的回归。',
        tags: ['Claude Code', 'MCP', '自动化'],
        links: []
      }
    ],
    links: [
      { label: 'GitHub',  value: 'lintao0511', href: 'https://github.com/lintao0511', icon: '⌨' },
      { label: '邮箱',    value: 'lintao0511@users.noreply.github.com', href: 'mailto:lintao0511@users.noreply.github.com', icon: '✉' }
    ]
  }
};
