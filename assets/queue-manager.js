(() => {
  "use strict";

  const STORAGE_KEY = "myGameArchive.queueManager.v1";

  const PLATFORM_META = {
    PC:    { label: "PC",   color: "#2563eb", className: "qm-pc" },
    NS1:   { label: "NS1",  color: "#b91c1c", className: "qm-ns1" },
    NS2:   { label: "NS2",  color: "#e60012", className: "qm-ns2" },
    GBA:   { label: "GBA",  color: "#16845b", className: "qm-gba" },
    "3DS": { label: "3DS",  color: "#7c3aed", className: "qm-3ds" },
    OTHER: { label: "其他", color: "#6b7280", className: "qm-other" }
  };

  const statusLabel = {
    now: "正在玩",
    next: "准备玩"
  };

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        overrides: {},
        custom: []
      };
    } catch {
      return { overrides: {}, custom: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  function normalizePlatform(text) {
    const s = (text || "").toUpperCase().replace(/\s+/g, "");
    if (s.includes("NS2") || s.includes("SWITCH2")) return "NS2";
    if (s.includes("NS1") || (s.includes("SWITCH") && !s.includes("2"))) return "NS1";
    if (s.includes("GBA") || s.includes("GAMEBOYADVANCE")) return "GBA";
    if (s.includes("3DS")) return "3DS";
    if (s.includes("PC") || s.includes("WINDOWS")) return "PC";
    return "OTHER";
  }

  function injectStyles() {
    if (document.getElementById("queue-manager-styles")) return;
    const style = document.createElement("style");
    style.id = "queue-manager-styles";
    style.textContent = `
      .qm-add-button {
        display:inline-flex; align-items:center; gap:8px;
        border:1px solid var(--line, #2a3139);
        background:rgba(18,22,27,.85); color:var(--text,#edf1f4);
        border-radius:999px; padding:10px 16px; cursor:pointer;
        font:inherit; font-size:13px; font-weight:650;
        transition:.18s ease;
      }
      .qm-add-button:hover { transform:translateY(-1px); border-color:#596672; }
      .qm-toolbar {
        display:flex; justify-content:flex-end; margin:24px 0 2px;
      }

      .qm-modal-backdrop {
        position:fixed; inset:0; z-index:9999;
        display:none; align-items:center; justify-content:center;
        padding:18px; background:rgba(0,0,0,.68);
        backdrop-filter:blur(7px);
      }
      .qm-modal-backdrop.qm-open { display:flex; }
      .qm-modal {
        width:min(520px,100%);
        max-height:calc(100vh - 36px);
        overflow:auto;
        border:1px solid var(--line,#2a3139);
        border-radius:18px;
        background:#11161b;
        box-shadow:0 30px 90px rgba(0,0,0,.48);
        padding:22px;
      }
      .qm-modal-header {
        display:flex; align-items:flex-start; justify-content:space-between;
        gap:18px; margin-bottom:20px;
      }
      .qm-modal-header h2 { margin:0; font-size:24px; }
      .qm-modal-header p { margin:5px 0 0; color:var(--muted,#929ca6); font-size:13px; }
      .qm-close {
        width:34px; height:34px; border-radius:50%;
        border:1px solid var(--line,#2a3139); background:transparent;
        color:var(--text,#edf1f4); cursor:pointer; font-size:20px;
      }

      .qm-form { display:grid; gap:15px; }
      .qm-field { display:grid; gap:7px; }
      .qm-field label {
        font-size:12px; color:var(--muted,#929ca6); font-weight:650;
      }
      .qm-field input,
      .qm-field select,
      .qm-field textarea {
        width:100%; box-sizing:border-box;
        border:1px solid var(--line,#2a3139);
        border-radius:11px;
        background:#0b0f13; color:var(--text,#edf1f4);
        padding:11px 12px; font:inherit; outline:none;
      }
      .qm-field textarea { min-height:105px; resize:vertical; line-height:1.6; }
      .qm-field input:focus,
      .qm-field select:focus,
      .qm-field textarea:focus { border-color:#637384; }

      .qm-form-row {
        display:grid; grid-template-columns:1fr 1fr; gap:12px;
      }
      .qm-actions {
        display:flex; justify-content:flex-end; gap:10px; margin-top:5px;
      }
      .qm-btn {
        border:1px solid var(--line,#2a3139);
        border-radius:10px; padding:9px 14px; cursor:pointer;
        font:inherit; font-size:13px;
      }
      .qm-btn-secondary { background:transparent; color:var(--muted,#929ca6); }
      .qm-btn-primary { background:#edf1f4; color:#0b0d10; font-weight:750; }

      .qm-platform-badge {
        position:absolute; top:10px; right:10px; z-index:8;
        color:#fff; border-radius:999px; padding:5px 8px;
        font-size:10px; font-weight:800; letter-spacing:.06em;
        border:1px solid rgba(255,255,255,.20);
        box-shadow:0 5px 16px rgba(0,0,0,.26);
      }
      .qm-pc{background:#2563eb}.qm-ns1{background:#b91c1c}
      .qm-ns2{background:#e60012}.qm-gba{background:#16845b}
      .qm-3ds{background:#7c3aed}.qm-other{background:#6b7280}

      .qm-card-actions {
        display:flex; gap:8px; margin-top:13px; padding-top:11px;
        border-top:1px solid var(--line,#2a3139);
      }
      .qm-card-action {
        appearance:none; border:0; background:transparent;
        color:var(--muted,#929ca6); padding:0; cursor:pointer;
        font:inherit; font-size:11px;
      }
      .qm-card-action:hover { color:var(--text,#edf1f4); }
      .qm-card-action.qm-delete:hover { color:#f2a9a9; }

      .qm-custom-cover {
        position:relative; display:flex; align-items:flex-end;
        aspect-ratio:2/3; padding:18px; box-sizing:border-box;
        background:
          radial-gradient(circle at 75% 18%, rgba(115,146,181,.18), transparent 35%),
          linear-gradient(145deg,#19212a,#0d1014 68%);
      }
      .qm-custom-cover small {
        display:block; color:#76828d; font-size:9px;
        letter-spacing:.16em; margin-bottom:5px;
      }
      .qm-custom-cover strong {
        display:block; color:#eef2f5; font-size:22px;
        line-height:1.15; letter-spacing:-.025em;
      }

      @media (max-width:560px) {
        .qm-form-row { grid-template-columns:1fr; }
        .qm-modal { padding:18px; }
      }
    `;
    document.head.appendChild(style);
  }

  function findQueueSections() {
    const sections = [...document.querySelectorAll(".queue-section")];
    let nowSection = null;
    let nextSection = null;
    for (const section of sections) {
      const title = section.querySelector("h2")?.textContent?.trim() || "";
      if (title.includes("最近在玩")) nowSection = section;
      if (title.includes("准备要玩")) nextSection = section;
    }
    return {
      nowSection,
      nextSection,
      nowGrid: nowSection?.querySelector(".queue-grid"),
      nextGrid: nextSection?.querySelector(".queue-grid")
    };
  }

  function getCardOriginalInfo(card, sectionStatus) {
    const name = card.querySelector("h3")?.textContent?.trim() || "未命名游戏";
    const badge = card.querySelector(".platform-badge, .qm-platform-badge");
    const platformText =
      badge?.textContent ||
      card.querySelector(".queue-platform")?.textContent ||
      "";
    const platform = normalizePlatform(platformText);
    const note = card.querySelector(".queue-note")?.textContent?.trim() || "";
    const originalId = "static-" + hashString(name + "|" + platform + "|" + sectionStatus);
    return { originalId, name, platform, note, status: sectionStatus };
  }

  function platformDisplay(platform) {
    return PLATFORM_META[platform] || PLATFORM_META.OTHER;
  }

  function ensureBadge(card, platform) {
    const cover = card.querySelector(".queue-cover");
    if (!cover) return;
    if (getComputedStyle(cover).position === "static") cover.style.position = "relative";

    card.querySelectorAll(".platform-badge, .qm-platform-badge").forEach(el => el.remove());
    const meta = platformDisplay(platform);
    const badge = document.createElement("span");
    badge.className = `qm-platform-badge ${meta.className}`;
    badge.textContent = meta.label;
    cover.appendChild(badge);
  }

  function updateCardContent(card, data) {
    const h3 = card.querySelector("h3");
    const note = card.querySelector(".queue-note");
    const state = card.querySelector(".queue-state");
    const platformLine = card.querySelector(".queue-platform");

    if (h3) h3.textContent = data.name;
    if (note) note.textContent = data.note || "";
    if (state) {
      state.textContent = statusLabel[data.status];
      state.classList.toggle("next-state", data.status === "next");
    }
    if (platformLine) {
      const platformNames = {
        PC: "PC",
        NS1: "Nintendo Switch",
        NS2: "Nintendo Switch 2",
        GBA: "Game Boy Advance",
        "3DS": "Nintendo 3DS",
        OTHER: "其他平台"
      };
      platformLine.textContent = platformNames[data.platform] || "其他平台";
    }
    ensureBadge(card, data.platform);
  }

  function addCardActions(card, info, store, sections, isCustom = false) {
    card.querySelector(".qm-card-actions")?.remove();

    const body = card.querySelector(".queue-card-body") || card;
    const actions = document.createElement("div");
    actions.className = "qm-card-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "qm-card-action";
    edit.textContent = "编辑";
    edit.addEventListener("click", () => openModal({
      mode: "edit",
      id: info.id,
      isCustom,
      data: info.data,
      card
    }));

    const del = document.createElement("button");
    del.type = "button";
    del.className = "qm-card-action qm-delete";
    del.textContent = "删除";
    del.addEventListener("click", () => {
      if (!confirm(`确定从清单中删除《${info.data.name}》吗？`)) return;
      const current = readStore();
      if (isCustom) {
        current.custom = current.custom.filter(x => x.id !== info.id);
      } else {
        current.overrides[info.id] = {
          ...(current.overrides[info.id] || {}),
          deleted: true
        };
      }
      writeStore(current);
      card.remove();
    });

    actions.append(edit, del);
    body.appendChild(actions);
  }

  function makeCustomCard(item) {
    const card = document.createElement("article");
    card.className = "queue-card";
    card.dataset.queueCustomId = item.id;

    const cover = document.createElement("div");
    cover.className = "queue-cover qm-custom-cover";
    const titleWrap = document.createElement("div");
    titleWrap.innerHTML = `<small>${statusLabel[item.status].toUpperCase()}</small><strong></strong>`;
    titleWrap.querySelector("strong").textContent = item.name;
    cover.appendChild(titleWrap);

    const body = document.createElement("div");
    body.className = "queue-card-body";
    body.innerHTML = `
      <div class="queue-state${item.status === "next" ? " next-state" : ""}">${statusLabel[item.status]}</div>
      <h3></h3>
      <p class="queue-platform"></p>
      <p class="queue-note"></p>
    `;
    body.querySelector("h3").textContent = item.name;
    body.querySelector(".queue-note").textContent = item.note || "";

    card.append(cover, body);
    updateCardContent(card, item);
    return card;
  }

  let modalBackdrop, form, nameInput, platformSelect, statusSelect, noteInput, modalTitle;
  let editingContext = null;

  function createModal() {
    modalBackdrop = document.createElement("div");
    modalBackdrop.className = "qm-modal-backdrop";
    modalBackdrop.innerHTML = `
      <div class="qm-modal" role="dialog" aria-modal="true" aria-labelledby="qm-modal-title">
        <div class="qm-modal-header">
          <div>
            <h2 id="qm-modal-title">添加游戏</h2>
            <p>内容只保存在当前浏览器中。</p>
          </div>
          <button class="qm-close" type="button" aria-label="关闭">×</button>
        </div>
        <form class="qm-form">
          <div class="qm-field">
            <label for="qm-name">游戏名称</label>
            <input id="qm-name" type="text" required maxlength="80" placeholder="例如：火焰纹章 Engage">
          </div>
          <div class="qm-form-row">
            <div class="qm-field">
              <label for="qm-platform">游戏平台</label>
              <select id="qm-platform">
                <option value="PC">PC</option>
                <option value="NS1">NS1</option>
                <option value="NS2">NS2</option>
                <option value="GBA">GBA</option>
                <option value="3DS">3DS</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div class="qm-field">
              <label for="qm-status">状态</label>
              <select id="qm-status">
                <option value="now">正在玩</option>
                <option value="next">准备玩</option>
              </select>
            </div>
          </div>
          <div class="qm-field">
            <label for="qm-note">备注</label>
            <textarea id="qm-note" maxlength="500" placeholder="例如：目前打到第 9 章；等风花雪月通关后再开坑。"></textarea>
          </div>
          <div class="qm-actions">
            <button class="qm-btn qm-btn-secondary" type="button" data-qm-cancel>取消</button>
            <button class="qm-btn qm-btn-primary" type="submit">保存</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modalBackdrop);

    modalTitle = modalBackdrop.querySelector("#qm-modal-title");
    form = modalBackdrop.querySelector(".qm-form");
    nameInput = modalBackdrop.querySelector("#qm-name");
    platformSelect = modalBackdrop.querySelector("#qm-platform");
    statusSelect = modalBackdrop.querySelector("#qm-status");
    noteInput = modalBackdrop.querySelector("#qm-note");

    const close = () => {
      modalBackdrop.classList.remove("qm-open");
      editingContext = null;
    };
    modalBackdrop.querySelector(".qm-close").addEventListener("click", close);
    modalBackdrop.querySelector("[data-qm-cancel]").addEventListener("click", close);
    modalBackdrop.addEventListener("click", e => {
      if (e.target === modalBackdrop) close();
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modalBackdrop.classList.contains("qm-open")) close();
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = nameInput.value.trim();
      if (!name) return;

      const data = {
        name,
        platform: platformSelect.value,
        status: statusSelect.value,
        note: noteInput.value.trim()
      };

      const store = readStore();
      const sections = findQueueSections();

      if (!editingContext) {
        const item = {
          id: "custom-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7),
          ...data
        };
        store.custom.push(item);
        writeStore(store);

        const card = makeCustomCard(item);
        const grid = item.status === "now" ? sections.nowGrid : sections.nextGrid;
        grid?.appendChild(card);
        addCardActions(card, { id: item.id, data: item }, store, sections, true);
      } else if (editingContext.isCustom) {
        const index = store.custom.findIndex(x => x.id === editingContext.id);
        if (index >= 0) {
          store.custom[index] = { ...store.custom[index], ...data };
          writeStore(store);
          const card = editingContext.card;
          updateCardContent(card, data);
          const grid = data.status === "now" ? sections.nowGrid : sections.nextGrid;
          grid?.appendChild(card);
          addCardActions(card, { id: editingContext.id, data }, store, sections, true);
        }
      } else {
        store.overrides[editingContext.id] = {
          ...(store.overrides[editingContext.id] || {}),
          ...data,
          deleted: false
        };
        writeStore(store);
        const card = editingContext.card;
        updateCardContent(card, data);
        const grid = data.status === "now" ? sections.nowGrid : sections.nextGrid;
        grid?.appendChild(card);
        addCardActions(card, { id: editingContext.id, data }, store, sections, false);
      }

      modalBackdrop.classList.remove("qm-open");
      editingContext = null;
    });
  }

  function openModal(context = null) {
    editingContext = context;
    if (context) {
      modalTitle.textContent = "编辑游戏";
      nameInput.value = context.data.name || "";
      platformSelect.value = context.data.platform || "OTHER";
      statusSelect.value = context.data.status || "now";
      noteInput.value = context.data.note || "";
    } else {
      modalTitle.textContent = "添加游戏";
      form.reset();
      platformSelect.value = "NS2";
      statusSelect.value = "now";
    }
    modalBackdrop.classList.add("qm-open");
    setTimeout(() => nameInput.focus(), 20);
  }

  function addToolbar() {
    const hero = document.querySelector(".queue-hero");
    if (!hero || document.querySelector(".qm-toolbar")) return;

    const toolbar = document.createElement("div");
    toolbar.className = "qm-toolbar";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "qm-add-button";
    btn.innerHTML = "<span>＋</span><span>添加游戏</span>";
    btn.addEventListener("click", () => openModal());
    toolbar.appendChild(btn);
    hero.insertAdjacentElement("afterend", toolbar);
  }

  function initStaticCards() {
    const store = readStore();
    const sections = findQueueSections();

    const processGrid = (grid, sectionStatus) => {
      if (!grid) return;
      [...grid.querySelectorAll(".queue-card")].forEach(card => {
        if (card.classList.contains("queue-add-card")) {
          card.remove();
          return;
        }
        const original = getCardOriginalInfo(card, sectionStatus);
        const override = store.overrides[original.originalId] || {};
        if (override.deleted) {
          card.style.display = "none";
          return;
        }

        const data = {
          name: override.name ?? original.name,
          platform: override.platform ?? original.platform,
          status: override.status ?? original.status,
          note: override.note ?? original.note
        };

        updateCardContent(card, data);
        card.dataset.queueStaticId = original.originalId;

        const targetGrid = data.status === "now" ? sections.nowGrid : sections.nextGrid;
        targetGrid?.appendChild(card);

        addCardActions(
          card,
          { id: original.originalId, data },
          store,
          sections,
          false
        );
      });
    };

    processGrid(sections.nowGrid, "now");
    processGrid(sections.nextGrid, "next");
  }

  function renderCustomCards() {
    const store = readStore();
    const sections = findQueueSections();
    store.custom.forEach(item => {
      if (document.querySelector(`[data-queue-custom-id="${CSS.escape(item.id)}"]`)) return;
      const card = makeCustomCard(item);
      const grid = item.status === "now" ? sections.nowGrid : sections.nextGrid;
      grid?.appendChild(card);
      addCardActions(card, { id: item.id, data: item }, store, sections, true);
    });
  }

  function init() {
    if (!document.querySelector(".queue-page")) return;
    injectStyles();
    createModal();
    addToolbar();
    initStaticCards();
    renderCustomCards();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();