/* ════════════════════════════════════════════════════════════
   Lin Tao · 个人主页 —— 登录 + 内容加载
   ════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const CFG = window.SITE_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const authView = $('authView'), homeView = $('homeView');

  // ── Supabase 客户端 ──
  const url = (CFG.supabaseUrl || '').trim();
  const key = (CFG.supabaseAnonKey || '').trim();
  const configured = /^https:\/\/.+\.supabase\.co$/.test(url) && key.length > 20 && !key.startsWith('YOUR');

  const sb = configured
    ? window.supabase.createClient(url, key, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  let mode = 'login';           // 'login' | 'signup' | 'forgot'
  let profile = null;

  // ══════════ 登录页 ══════════
  const authForm = $('authForm');
  const authMsg  = $('authMsg');

  function setMsg(text, ok) {
    authMsg.textContent = text || '';
    authMsg.classList.toggle('ok', !!ok);
  }

  function setBusy(on) {
    $('authSubmit').disabled = on;
    $('authSubmit').querySelector('.spinner').hidden = !on;
    $('authSubmit').querySelector('.btn-label').textContent =
      on ? (mode === 'signup' ? '注册中' : mode === 'forgot' ? '发送中' : '登录中')
         : (mode === 'signup' ? '创建账号' : mode === 'forgot' ? '发送重置邮件' : '进入');
  }

  function applyMode() {
    const titles = {
      login:  ['欢迎回来', '登录以访问你的个人主页', '进入'],
      signup: ['创建账号', '注册后即可进入你的个人主页', '创建账号'],
      forgot: ['重置密码', '输入注册邮箱，我们会发送重置链接', '发送重置邮件']
    };
    $('authTitle').textContent = titles[mode][0];
    $('authSub').textContent   = titles[mode][1];
    $('authSubmit').querySelector('.btn-label').textContent = titles[mode][2];
    $('password').style.display = mode === 'forgot' ? 'none' : '';
    $('toggleMode').textContent =
      mode === 'login' ? '没有账号？去注册' :
      mode === 'signup' ? '已有账号？去登录' : '返回登录';
    setMsg('');
  }
  applyMode();

  $('toggleMode').addEventListener('click', () => {
    mode = mode === 'signup' ? 'login' : 'signup';
    applyMode();
  });
  $('forgotBtn').addEventListener('click', () => {
    mode = mode === 'forgot' ? 'login' : 'forgot';
    applyMode();
  });

  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!sb) {
      setMsg('Supabase 尚未配置：请在 assets/config.js 填入 Project URL 和 anon key。');
      return;
    }
    const email = $('email').value.trim();
    const password = $('password').value;
    if (!email) { setMsg('请填写邮箱'); return; }
    if (mode !== 'forgot' && password.length < 6) { setMsg('密码至少 6 位'); return; }

    setBusy(true); setMsg('');
    try {
      if (mode === 'forgot') {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + location.pathname
        });
        if (error) throw error;
        setMsg('重置邮件已发送，请查收。', true);
      } else if (mode === 'signup') {
        const { data, error } = await sb.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          await afterLogin(data.user);
        } else {
          setMsg('注册成功。若需邮箱验证，请先去邮箱完成验证再登录。', true);
          mode = 'login'; applyMode();
        }
      } else {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await afterLogin(data.user);
      }
    } catch (err) {
      const msg = String(err && err.message || err);
      setMsg(
        /invalid login credentials/i.test(msg) ? '邮箱或密码不正确'
        : /already registered|already exists/i.test(msg) ? '这个邮箱已经注册过了'
        : /rate limit|too many/i.test(msg) ? '尝试次数过多，稍后再试'
        : /email not confirmed/i.test(msg) ? '邮箱尚未验证，请先查收验证邮件'
        : msg
      );
    } finally {
      setBusy(false);
    }
  });

  // ══════════ 会话 ══════════
  sb && sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (session && session.user) afterLogin(session.user);
    } else if (event === 'SIGNED_OUT') {
      showAuth();
    }
  });

  async function boot() {
    if (!sb) { showAuth(); return; }
    const { data } = await sb.auth.getSession();
    if (data && data.session && data.session.user) await afterLogin(data.session.user);
    else showAuth();
  }

  $('logoutBtn').addEventListener('click', async () => {
    if (sb) await sb.auth.signOut();
    showAuth();
  });

  function showAuth() {
    homeView.classList.add('hide');
    authView.classList.remove('hide');
    $('password').value = '';
  }

  // ══════════ 内容加载 ══════════
  async function afterLogin(user) {
    authView.classList.add('hide');
    homeView.classList.remove('hide');
    setMsg('');
    render(await loadProfile(user));
    if (user && user.email) {
      $('statusText').textContent = user.email;
    }
  }

  async function loadProfile(user) {
    const fallback = CFG.defaultProfile || {};
    if (!sb) return fallback;
    try {
      const email = (user && user.email) || '';
      const { data, error } = await sb
        .from('site_profile')
        .select('*')
        .eq('owner_email', email)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        $('lastSync').textContent = new Date(data.updated_at || Date.now()).toLocaleString('zh-CN');
        return {
          display_name: data.display_name || fallback.display_name,
          tagline: data.tagline || fallback.tagline,
          bio: data.bio || fallback.bio,
          avatar_url: data.avatar_url || '',
          location: data.location || '',
          skills: data.skills && data.skills.length ? data.skills : fallback.skills,
          projects: data.projects && data.projects.length ? data.projects : fallback.projects,
          links: data.links && data.links.length ? data.links : fallback.links
        };
      }

      // 首次登录：写入一行，之后你可以在 Supabase 后台直接编辑
      const row = {
        owner_email: email,
        display_name: fallback.display_name,
        tagline: fallback.tagline,
        bio: fallback.bio,
        skills: fallback.skills,
        projects: fallback.projects,
        links: fallback.links
      };
      const { error: insErr } = await sb.from('site_profile').insert(row);
      if (insErr && !/duplicate|already/i.test(insErr.message)) throw insErr;
      $('lastSync').textContent = '刚刚';
      return fallback;
    } catch (e) {
      console.warn('加载 profile 失败，使用默认内容：', e);
      $('lastSync').textContent = '本地默认';
      return fallback;
    }
  }

  // ══════════ 渲染 ══════════
  function render(p) {
    profile = p;
    const name = p.display_name || '未命名';
    $('displayName').textContent = name;
    $('tagline').textContent = p.tagline || '';
    $('bio').textContent = p.bio || '';
    $('footName').textContent = name;
    $('year').textContent = new Date().getFullYear();

    if (p.avatar_url) {
      const img = $('avatar');
      img.src = p.avatar_url;
      img.hidden = false;
      $('avatarFallback').style.display = 'none';
    } else {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      const initials = parts.length > 1
        ? parts[0][0] + parts[1][0]
        : name.trim().slice(0, 2);
      $('avatarFallback').textContent = initials.toUpperCase();
    }

    const meta = $('heroMeta');
    meta.innerHTML = '';
    if (p.location) meta.appendChild(metaItem('⌖', p.location));
    const now = new Date();
    meta.appendChild(metaItem('◷', '本地时间 ' + now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })));
    meta.appendChild(metaItem('⇅', '已同步 · 多端可用'));

    $('skillCloud').innerHTML = (p.skills || []).map(s => {
      const name = typeof s === 'string' ? s : s.name;
      const icon = typeof s === 'string' ? '·' : (s.icon || '·');
      return `<span class="skill"><i>${esc(icon)}</i>${esc(name)}</span>`;
    }).join('');

    $('projectGrid').innerHTML = (p.projects || []).map(pr => {
      const tags = (pr.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
      const links = (pr.links || []).map(l =>
        `<a href="${esc(l.href || '#')}" target="_blank" rel="noopener">${esc(l.label || '链接')} ↗</a>`).join('');
      return `<article class="card">
        <h3>${esc(pr.title || '')}</h3>
        <p>${esc(pr.desc || '')}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ''}
        ${links ? `<div class="card-links">${links}</div>` : ''}
      </article>`;
    }).join('');

    $('linkGrid').innerHTML = (p.links || []).map(l => `
      <a class="contact-card" href="${esc(l.href || '#')}" target="_blank" rel="noopener">
        <span class="contact-icon">${esc(l.icon || '◈')}</span>
        <span class="contact-text"><b>${esc(l.label || '')}</b><span>${esc(l.value || '')}</span></span>
      </a>`).join('');
  }

  function metaItem(icon, text) {
    const s = document.createElement('span');
    s.innerHTML = `<b style="color:var(--dim)">${icon}</b> ${esc(text)}`;
    return s;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  boot();
})();
