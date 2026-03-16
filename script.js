const lerp = (a, b, t) => a + (b - a) * t;

const state = {
  mouseX: 0,
  mouseY: 0,
  targetX: 0,
  targetY: 0,
};

window.addEventListener("mousemove", (e) => {
  state.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  state.targetY = (e.clientY / window.innerHeight) * 2 - 1;
});

function animate() {
  state.mouseX = lerp(state.mouseX, state.targetX, 0.06);
  state.mouseY = lerp(state.mouseY, state.targetY, 0.06);

  const orbs = document.querySelectorAll(".orb");
  orbs.forEach((el, i) => {
    const strength = 12 + i * 4;
    const x = state.mouseX * strength;
    const y = state.mouseY * strength;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  requestAnimationFrame(animate);
}

animate();

const modal = document.getElementById("postcard-modal");
const backdrop = document.getElementById("modal-backdrop");
const closeBtn = document.getElementById("close-postcard");
const openNav = document.getElementById("open-postcard");
const openHero = document.getElementById("open-postcard-hero");
const chips = document.querySelectorAll(".template-chips .chip");
const chipsContainer = document.querySelector(".template-chips");
const editorEl = document.getElementById("postcard-text");
const modalCardEl = document.getElementById("postcard-shell");
const form = document.getElementById("postcard-form");
const nameEl = document.getElementById("sender-name");
const emailEl = document.getElementById("sender-email");
const resetBtn = document.getElementById("reset-postcard");
const hintEl = document.getElementById("postcard-hint");
const counterEl = document.getElementById("postcard-counter");
const MAX_LEN = 300;
let toastTimer = null;
const toastLayer = document.getElementById("toast");
const toastBubble = document.getElementById("toast-bubble");

const THEME_VARS = {
  minimal: {
    accent1: "rgba(184,255,102,0.45)",
    accent2: "rgba(123,211,137,0.35)",
    border: "rgba(123,211,137,0.55)",
  },
  cyberpunk: {
    accent1: "rgba(0,229,255,0.60)",
    accent2: "rgba(255,59,240,0.45)",
    border: "rgba(0,229,255,0.80)",
  },
  future: {
    accent1: "rgba(142,240,184,0.50)",
    accent2: "rgba(123,217,255,0.45)",
    border: "rgba(123,217,255,0.65)",
  },
  forest: {
    accent1: "rgba(76,175,80,0.55)",
    accent2: "rgba(255,204,102,0.45)",
    border: "rgba(76,175,80,0.70)",
  },
};

function showToast(text) {
  if (!toastLayer || !toastBubble) return;
  if (modalCardEl) {
    const cs = getComputedStyle(modalCardEl);
    const a1 = cs.getPropertyValue("--pc-accent-1")?.trim();
    const a2 = cs.getPropertyValue("--pc-accent-2")?.trim();
    const bd = cs.getPropertyValue("--pc-border")?.trim();
    const ff = cs.getPropertyValue("--pc-font")?.trim();
    if (a1) toastLayer.style.setProperty("--pc-accent-1", a1);
    if (a2) toastLayer.style.setProperty("--pc-accent-2", a2);
    if (bd) toastLayer.style.setProperty("--pc-border", bd);
    if (ff) toastLayer.style.setProperty("--pc-font", ff);
  }
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  toastBubble.textContent = text;
  toastLayer.style.display = "grid";
  requestAnimationFrame(() => {
    toastLayer.classList.add("show");
  });
  setTimeout(() => {
    const rect = toastBubble.getBoundingClientRect();
    if ((rect.width === 0 && rect.height === 0) || !document.body.contains(toastLayer)) {
      alert(text);
    }
  }, 50);
  toastTimer = setTimeout(() => {
    toastLayer.classList.remove("show");
    setTimeout(() => { toastLayer.style.display = "none"; }, 220);
  }, 1500);
}

function openModal() {
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");

  if (editorEl) {
    editorEl.focus();
    const len = editorEl.value.length;
    if (typeof editorEl.setSelectionRange === "function") {
      editorEl.setSelectionRange(len, len);
    }
  }
}
function closeModal() {
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

if (openNav) openNav.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
if (openHero) openHero.addEventListener("click", (e) => { e.preventDefault(); openModal(); });
if (backdrop) backdrop.addEventListener("click", closeModal);
if (closeBtn) closeBtn.addEventListener("click", closeModal);

let currentTpl = "minimal";
function setTemplate(t) {
  if (!t) return;
  currentTpl = t;

  if (modalCardEl) {
    modalCardEl.setAttribute("data-template", t);
    const tv = THEME_VARS[t];
    if (tv) {
      modalCardEl.style.setProperty("--pc-accent-1", tv.accent1);
      modalCardEl.style.setProperty("--pc-accent-2", tv.accent2);
      modalCardEl.style.setProperty("--pc-border", tv.border);
      const primaryBtn = modalCardEl.querySelector(".btn.primary");
      if (primaryBtn) {
        primaryBtn.style.background = `linear-gradient(120deg, ${tv.accent1}, ${tv.accent2})`;
        primaryBtn.style.borderColor = tv.border;
      }
    }
    void modalCardEl.offsetHeight;
  }

  if (editorEl) {
    const tplClasses = ["tpl-minimal", "tpl-cyberpunk", "tpl-future", "tpl-forest"];
    editorEl.classList.remove(...tplClasses);
    editorEl.classList.add("tpl-" + t);
  }
  return currentTpl;
}
chips.forEach(ch => {
  ch.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("selected"));
    ch.classList.add("selected");
    setTemplate(ch.dataset.template);
  });
});
chipsContainer?.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  e.preventDefault();
  chips.forEach(c => c.classList.remove("selected"));
  btn.classList.add("selected");
  setTemplate(btn.dataset.template);
});
setTemplate("minimal");
chips[0]?.classList.add("selected");

editorEl?.addEventListener("input", () => {
  let v = editorEl.value || "";
  if (v.length > MAX_LEN) {
    v = v.slice(0, MAX_LEN);
    editorEl.value = v;
    editorEl.selectionStart = editorEl.selectionEnd = v.length;
  }
  if (counterEl) counterEl.textContent = `${v.length}/${MAX_LEN}`;
});
document.getElementById("postcard-counter")?.addEventListener("mousedown", (e) => e.preventDefault());

function savePostcard(data) {
  try {
    const key = "glassfolio_postcards";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    list.push(data);
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = (editorEl.value || "").trim();
  const nick = nameEl.value.trim();
  if (!nick) {
    hintEl.textContent = "请填写昵称";
    hintEl.classList.remove("success");
    hintEl.classList.add("error");
    nameEl.classList.add("error");
    nameEl.focus();
    return;
  } else {
    nameEl.classList.remove("error");
  }
  if (!message) {
    hintEl.textContent = "请填写留言内容";
    hintEl.classList.remove("success");
    hintEl.classList.add("error");
    editorEl.classList.add("error");
    editorEl.focus();
    return;
  }
  const item = {
    name: nick,
    email: emailEl.value.trim(),
    message,
    template: currentTpl,
    createdAt: new Date().toISOString(),
  };
  savePostcard(item);
  hintEl.textContent = "";
  hintEl.classList.remove("success");
  hintEl.classList.remove("error");
  nameEl.classList.remove("error");
  editorEl.classList.remove("error");
  closeModal();
  if (toastLayer) {
    showToast("信号已发射，正在飘向黄萍的后台...");
  } else {
    alert("信号已发射，正在飘向黄萍的后台...");
  }
  editorEl.value = "";
  if (counterEl) counterEl.textContent = `0/${MAX_LEN}`;
});

resetBtn?.addEventListener("click", () => {
  nameEl.value = "";
  emailEl.value = "";
  editorEl.value = "";
  hintEl.textContent = "";
  hintEl.classList.remove("success");
  hintEl.classList.remove("error");
  nameEl.classList.remove("error");
  editorEl.classList.remove("error");
  setTemplate("minimal");
  chips.forEach(c => c.classList.remove("selected"));
  chips[0]?.classList.add("selected");
  if (counterEl) counterEl.textContent = `0/${MAX_LEN}`;
});

const xhsChip = document.getElementById("xhs-chip");
const xhsPopup = document.getElementById("xhs-qr-popup");
const xhsClose = document.getElementById("xhs-qr-close");
function openXhs() {
  if (!xhsPopup) return;
  xhsPopup.classList.add("open");
  xhsPopup.setAttribute("aria-hidden", "false");
}
function closeXhs() {
  if (!xhsPopup) return;
  xhsPopup.classList.remove("open");
  xhsPopup.setAttribute("aria-hidden", "true");
}
xhsChip?.addEventListener("click", (e) => {
  e.preventDefault();
  openXhs();
});
xhsClose?.addEventListener("click", closeXhs);
document.addEventListener("click", (e) => {
  const target = e.target;
  if (!xhsPopup?.classList.contains("open")) return;
  if (xhsPopup.contains(target) || xhsChip === target) return;
  closeXhs();
});

/* =========================================
   晚风说 · 沉浸式弹窗逻辑
   ========================================= */

const VANFENG_DATA = {
  speak: {
    title: "倾诉空间",
    tag: "正在浏览：倾诉",
    video: "./assets/projects/vibe/talk.mp4",
    content: `
      <div class="v-section">
        <h4>🌙 AI 暖性倾诉体验</h4>
        <p>通过"无键盘"设计，用户只需按住说话，AI 会实时将语音转化为文字，并根据语调情感自动匹配标点符号。</p>
        <ul class="list">
          <li>自研语义分段算法，告别由于语速过快导致的文字堆砌。</li>
          <li>后台采用微调后的 Llama-3 模型，提供最懂人心的回应。</li>
        </ul>
        <div class="v-gallery">
          <img src="./assets/projects/vibe/talk-1.png" class="scroll-zoom" alt="倾诉界面">
          <img src="./assets/projects/vibe/talk-2.png" class="scroll-zoom" alt="AI回应">
          <img src="./assets/projects/vibe/talk-3.png" class="scroll-zoom" alt="语音输入">
        </div>
      </div>
    `
  },
  history: {
    title: "时光胶片",
    tag: "正在浏览：历史",
    video: "./assets/projects/vibe/history.mp4",
    content: `
      <div class="v-section">
        <h4>🎞️ 情绪档案管理</h4>
        <p>打破传统的列表式记录，使用"电影胶卷"形式横向滚动展现用户的每一段回忆。</p>
        <ul class="list">
          <li>自动提取关键词，生成每段倾诉的"核心摘要"。</li>
          <li>支持按情绪颜色（红-愤怒、蓝-忧郁、金-快乐）进行快速筛选。</li>
        </ul>
        <div class="v-gallery">
          <img src="./assets/projects/vibe/history-1.png" class="scroll-zoom" alt="历史列表">
          <img src="./assets/projects/vibe/history-2.png" class="scroll-zoom" alt="胶卷视图">
          <img src="./assets/projects/vibe/history-3.png" class="scroll-zoom" alt="详情页">
        </div>
      </div>
    `
  },
  mood: {
    title: "情绪波纹",
    tag: "正在浏览：情绪",
    video: "./assets/projects/vibe/mood.mp4",
    content: `
      <div class="v-section">
        <h4>📈 数据可视化洞察</h4>
        <p>作为数据科学背景的产物，我设计了"情绪波纹"功能，将一周的情绪波动转化为流动的波纹曲线。</p>
        <ul class="list">
          <li>支持导出"情绪周报"，为心理健康提供量化参考。</li>
          <li>利用 D3.js 渲染，确保持滑的交互反馈。</li>
        </ul>
        <div class="v-gallery">
          <img src="./assets/projects/vibe/mood-1.png" class="scroll-zoom" alt="情绪曲线">
          <img src="./assets/projects/vibe/mood-2.png" class="scroll-zoom" alt="周报导出">
          <img src="./assets/projects/vibe/mood-3.png" class="scroll-zoom" alt="趋势分析">
        </div>
      </div>
    `
  },
  mine: {
    title: "个人岛屿",
    tag: "正在浏览：我的",
    video: "./assets/projects/vibe/profile.mp4",
    content: `
      <div class="v-section">
        <h4>🏠 私密性与个性化</h4>
        <p>在这里，每一位用户都拥有一座独有的"数字岛屿"，随着使用天数的增加，岛屿会逐渐繁茂。</p>
        <ul class="list">
          <li>支持自定义 App 背景，适配深夜使用习惯。</li>
          <li>严格的加密协议，确保个人数据不外泄。</li>
        </ul>
        <div class="v-gallery">
          <img src="./assets/projects/vibe/profile-1.png" class="scroll-zoom" alt="个人中心">
          <img src="./assets/projects/vibe/profile-2.png" class="scroll-zoom" alt="岛屿成长">
          <img src="./assets/projects/vibe/profile-3.png" class="scroll-zoom" alt="设置页面">
        </div>
      </div>
    `
  }
};

const vModal = document.getElementById('vanfeng-modal');
const vVideo = document.getElementById('v-video');
const vTag = document.getElementById('v-tag');
const vScroll = document.getElementById('v-scroll');
const closeVBtn = document.getElementById('close-vanfeng');
const vBackdrop = document.getElementById('vanfeng-backdrop');
const vToggleMute = document.getElementById('v-toggle-mute');
const vTogglePlay = document.getElementById('v-toggle-play');

function openVanfeng(type) {
  const vModal = document.getElementById('vanfeng-modal');
  const data = VANFENG_DATA[type];
  if (!data || !vModal) return;

  // 1. 先停止背景干扰
  const orbs = document.querySelector('.orbs');
  if (orbs) orbs.style.visibility = 'hidden';

  // 2. 显示弹窗
  vModal.classList.add('open');

  // 3. 填充内容
  vTag.textContent = data.tag;
  vVideo.src = data.video;
  vScroll.innerHTML = data.content;

  vModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  
  vVideo.play().catch(() => {});

  const images = vScroll.querySelectorAll('.scroll-zoom');
  let ticking = false;
  function evalCenterInView() {
    const containerRect = vScroll.getBoundingClientRect();
    const center = (containerRect.top + containerRect.bottom) / 2;
    const threshold = containerRect.height * 0.25;
    images.forEach((img) => {
      const r = img.getBoundingClientRect();
      const mid = (r.top + r.bottom) / 2;
      const dist = Math.abs(mid - center);
      if (dist <= threshold) {
        img.classList.add('in-view');
      } else {
        img.classList.remove('in-view');
      }
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(evalCenterInView);
    }
  }
  vScroll.addEventListener('scroll', onScroll, { passive: true });
  requestAnimationFrame(evalCenterInView);
}

function closeVanfeng() {
  if (!vModal) return;
  vModal.classList.remove('open');
  vModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  vVideo.pause();
  vVideo.src = "";
  
  // 恢复背景 orbs
  const orbs = document.querySelector('.orbs');
  if (orbs) orbs.style.visibility = '';
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.vanfeng-open');
  if (btn) {
    const pageType = btn.getAttribute('data-page');
    openVanfeng(pageType);
  }
});

closeVBtn?.addEventListener('click', closeVanfeng);
vBackdrop?.addEventListener('click', closeVanfeng);

vToggleMute?.addEventListener('click', () => {
  if (!vVideo) return;
  vVideo.muted = !vVideo.muted;
  vToggleMute.textContent = vVideo.muted ? '开声音' : '静音';
});

vTogglePlay?.addEventListener('click', () => {
  if (!vVideo) return;
  if (vVideo.paused) {
    vVideo.play();
    vTogglePlay.textContent = '暂停';
  } else {
    vVideo.pause();
    vTogglePlay.textContent = '播放';
  }
});

function copyUrl(btn) {
  const urlInput = document.getElementById('vanfeng-url');
  if (!urlInput) return;
  
  urlInput.select();
  document.execCommand("copy");
  
  if (typeof showToast === 'function') {
    showToast("体验链接已复制");
  } else {
    alert("链接已复制");
  }
  
  if (btn) {
    const old = btn.textContent;
    btn.textContent = "已复制";
    setTimeout(() => { btn.textContent = old; }, 800);
  }
}

function copyDocUrl(btn) {
  const urlInput = document.getElementById('doc-url');
  if (!urlInput) return;
  
  urlInput.select();
  document.execCommand("copy");
  
  if (typeof showToast === 'function') {
    showToast("文档链接已复制");
  } else {
    alert("链接已复制");
  }
  
  if (btn) {
    const old = btn.textContent;
    btn.textContent = "已复制";
    setTimeout(() => { btn.textContent = old; }, 800);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (vModal?.classList.contains('open')) {
      closeVanfeng();
    }
    if (modal?.classList.contains('open')) {
      closeModal();
    }
    if (xhsPopup?.classList.contains('open')) {
      closeXhs();
    }
    const githubModal = document.getElementById('github-modal');
    if (githubModal?.classList.contains('open')) {
      githubModal.classList.remove('open');
    }
  }
});

// 侧边栏滚动监听逻辑
(function() {
  const sections = [
    { id: 'education' },
    { id: 'internship' },
    { id: 'vanfeng' },
    { id: 'skills' },
    { id: 'projects' },
    { id: 'statement' },
    { id: 'contact' }
  ];

  const options = {
    root: null,
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    let currentSection = null;
    let highestIntersection = 0;
    
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > highestIntersection) {
        highestIntersection = entry.intersectionRatio;
        currentSection = entry.target;
      }
    });
    
    // 移除所有active类
    document.querySelectorAll('.side-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    if (currentSection) {
      const sectionId = currentSection.id;
      const activeLink = document.querySelector(`.side-nav-link[href="#${sectionId}"]`);
      if (activeLink) {
        activeLink.classList.add('active');
      }
    } else if (window.scrollY < 100) {
      // 如果没有活跃的章节且在页面顶部，激活首页链接
      const homeLink = document.querySelector('.side-nav-link[href="#"]');
      if (homeLink) {
        homeLink.classList.add('active');
      }
    }
  }, options);

  // 观察所有章节
  sections.forEach(section => {
    const element = document.getElementById(section.id);
    if (element) {
      observer.observe(element);
    }
  });

  // 点击侧边栏链接时平滑滚动
  document.querySelectorAll('.side-nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      
      // 移除所有active类
      document.querySelectorAll('.side-nav-link').forEach(l => {
        l.classList.remove('active');
      });
      // 激活当前点击的链接
      link.classList.add('active');
      
      if (targetId === '#') {
        // 滚动到页面顶部
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
  
  // 初始状态：激活首页链接
  window.addEventListener('load', () => {
    document.querySelectorAll('.side-nav-link').forEach(link => {
      link.classList.remove('active');
    });
    const homeLink = document.querySelector('.side-nav-link[href="#"]');
    if (homeLink) {
      homeLink.classList.add('active');
    }
  });
  
  // 滚动时检查是否在页面顶部
  window.addEventListener('scroll', () => {
    if (window.scrollY < 100) {
      document.querySelectorAll('.side-nav-link').forEach(link => {
        link.classList.remove('active');
      });
      const homeLink = document.querySelector('.side-nav-link[href="#"]');
      if (homeLink) {
        homeLink.classList.add('active');
      }
    }
  });
})();

// --- 独立的 GitHub 确认弹窗逻辑 ---
(function() {
  const githubLink = document.getElementById('github-link');
  // 只有 HTML 里有这个 ID 才会运行，防止报错
  if (!githubLink) return;

  const githubModal = document.createElement('div');
  githubModal.className = 'custom-github-modal'; // 使用专属类名
  githubModal.innerHTML = `
    <div class="custom-github-backdrop"></div>
    <div class="custom-github-card">
      <h3 style="color: #b8ff66; margin-bottom: 12px; margin-top: 0;">确认跳转</h3>
      <p style="color: rgba(255,255,255,0.8); margin-bottom: 24px; font-size: 14px;">是否前往 GitHub 主页查看项目源码？</p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button class="btn primary" id="github-confirm" style="padding: 8px 20px;">前往</button>
        <button class="btn ghost" id="github-cancel" style="padding: 8px 20px;">取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(githubModal);

  // 点击链接打开弹窗
  githubLink.addEventListener('click', (e) => {
    e.preventDefault();
    githubModal.style.display = 'flex'; // 关键：点击时才从 none 变成 flex
  });

  // 关闭逻辑
  const closeGit = () => { githubModal.style.display = 'none'; };

  githubModal.querySelector('#github-cancel').addEventListener('click', closeGit);
  githubModal.querySelector('.custom-github-backdrop').addEventListener('click', closeGit);
  githubModal.querySelector('#github-confirm').addEventListener('click', () => {
    window.open(githubLink.href || 'https://github.com/pennyH423', '_blank');
    closeGit();
  });
})();