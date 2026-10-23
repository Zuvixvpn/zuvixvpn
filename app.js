const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const params = new URLSearchParams(location.search);
const API_BASE = window.ZUVIX_API_URL || params.get("api") || "/api";
const plans = [...document.querySelectorAll(".plan")];
const continueBtn = document.getElementById("continue");
const price = document.getElementById("selectedPrice");
const promo = document.getElementById("promo");
const promoBtn = document.getElementById("promoBtn");
const promoMsg = document.getElementById("promoMsg");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
let selected = null;

const user = tg?.initDataUnsafe?.user || null;
// Защита от подмены tg_id: подписанные initData уходят на сервер, где проверяется HMAC
const auth = tg?.initData || "";
const tgId = user?.id || Number(new URLSearchParams(location.search).get("tg_id") || 0);

const docs = {
  privacy: {
    title: "Политика конфиденциальности",
    html: `<p>Настоящая политика описывает сбор, обработку, хранение и защиту данных пользователей ZUVIX VPN.</p><h3>Какие данные могут обрабатываться</h3><p>Имя, Telegram ID, username, сведения о заказах и подписках, статус платежа, технические данные и обращения в поддержку.</p><h3>Для чего это нужно</h3><p>Для предоставления сервиса, управления подпиской, обработки платежей, поддержки, безопасности и предотвращения злоупотреблений.</p><h3>Передача данных</h3><p>Данные не продаются третьим лицам. При необходимости они могут передаваться платёжным и техническим поставщикам только в объёме, необходимом для работы сервиса.</p><h3>Права пользователя</h3><p>В предусмотренных законом случаях можно запросить доступ, изменение или удаление персональных данных через поддержку.</p><p><a href="https://telegra.ph/POLITIKA-KONFIDENCIALNOSTI-08-12-99" target="_blank">Открыть исходную редакцию</a></p>`
  },
  terms: {
    title: "Пользовательское соглашение",
    html: `<p>Использование ZUVIX VPN, оформление заказа или получение доступа означает принятие условий соглашения в пределах применимого законодательства.</p><h3>Услуга</h3><p>Сервис предоставляет цифровой доступ на срок и на условиях выбранного тарифа. Стоимость и срок указываются до оплаты.</p><h3>Запрещённое использование</h3><p>Запрещается использовать сервис для мошенничества, вредоносных действий, нарушения закона или прав третьих лиц.</p><h3>Работа сервиса</h3><p>Возможны технические перерывы и ограничения, необходимые для обновления или безопасности.</p><p><a href="https://telegra.ph/PUBLICHNAYA-OFERTA-08-12-15" target="_blank">Открыть исходную редакцию</a></p>`
  },
  "bot-policy": {
    title: "Политика Telegram-бота",
    html: `<p>Telegram-бот ZUVIX VPN используется для управления доступом к сервису, промокодами, подпиской и открытия Mini App.</p><h3>Что получает бот</h3><p>Telegram ID, username и имя, если они предоставлены Telegram, а также сведения, которые пользователь отправляет боту сам.</p><h3>Что бот не запрашивает</h3><p>Пароли, коды входа в Telegram и полные реквизиты банковских карт.</p><h3>Хранение</h3><p>Данные подписки и промокодов могут храниться в базе сервиса для работы личного кабинета и поддержки.</p><h3>Безопасность</h3><p>Не передавайте боту коды авторизации, пароли и другие секретные данные.</p>`
  },
  refund: {
    title: "Условия возврата",
    html: `<p>Возврат рассматривается индивидуально с учётом применимого законодательства и фактического состояния цифровой услуги.</p><h3>Если доступ ещё не был предоставлен</h3><p>Пользователь может обратиться в поддержку с запросом на возврат. Заявка рассматривается по обстоятельствам заказа.</p><h3>Если есть техническая проблема</h3><p>Сначала поддержка проверяет проблему и может восстановить доступ. Если услуга не может быть предоставлена по вине сервиса, вопрос о возврате рассматривается отдельно.</p><h3>Что указать в обращении</h3><p>Telegram ID, дату платежа, выбранный тариф и описание проблемы. Не отправляйте данные банковской карты или коды подтверждения.</p><h3>Куда писать</h3><p>Telegram: <a href="https://t.me/ZUVIXv" target="_blank">@ZUVIXv</a><br>Email: <a href="mailto:zuviksvpn@gmail.com">zuviksvpn@gmail.com</a></p><p class="muted">Эти условия являются информационным шаблоном и должны быть проверены владельцем сервиса с учётом применимого законодательства и правил платёжного провайдера.</p>`
  },
  setup: {
    title: "Инструкции по подключению",
    html: `
      <h3>📱 Android</h3>
      <ol><li>Установите приложение-клиент (V2rayNG / Nekobox) по ссылке из бота.</li>
      <li>Откройте бота ZUVIX VPN → «📱 Открыть приложение» и скопируйте конфигурацию.</li>
      <li>Вставьте конфигурацию в клиент и нажмите «Подключить».</li></ol>
      <h3>🍎 iPhone</h3>
      <ol><li>Установите приложение FoXray или V2Box из App Store.</li>
      <li>Скопируйте конфигурацию из бота.</li>
      <li>Вставьте в приложение и включите переключатель VPN.</li></ol>
      <h3>💻 Windows</h3>
      <ol><li>Установите клиент v2rayN / InvisibleMan.</li>
      <li>Импортируйте конфигурацию из буфера обмена.</li>
      <li>Выберите сервер и нажмите «Activate».</li></ol>
      <h3>🖥 macOS</h3>
      <ol><li>Установите FoXray или V2Box из Mac App Store.</li>
      <li>Добавьте конфигурацию и разрешите добавление VPN в настройках системы.</li></ol>
      <p class="muted">Не получается? Напишите в поддержку: <a href="https://t.me/ZUVIXv" target="_blank">@ZUVIXv</a> или <a href="mailto:zuviksvpn@gmail.com">zuviksvpn@gmail.com</a>.</p>`
  }
};

function openDoc(key) {
  const doc = docs[key];
  if (!doc) return;
  modalTitle.textContent = doc.title;
  modalBody.innerHTML = doc.html;
  modal.classList.remove("hidden");
  tg?.HapticFeedback?.selectionChanged();
}

document.querySelectorAll(".doc").forEach(btn => btn.addEventListener("click", () => openDoc(btn.dataset.doc)));
document.getElementById("modalClose").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

// Быстрые кнопки «Поддержка» и «FAQ»
document.getElementById("faqChip").addEventListener("click", () =>
  document.getElementById("faq").scrollIntoView({behavior: "smooth", block: "start"}));
document.getElementById("supportChip").addEventListener("click", () =>
  document.getElementById("support").scrollIntoView({behavior: "smooth", block: "start"}));

// ---------- состояние ----------
let balance = 0;
let discount = 0;
let hasSub = false;
let loaded = false;

// Экранирование данных из API перед вставкой в HTML
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));

const cabinetEl = document.getElementById("cabinet");
const buyMsg = document.getElementById("buyMsg");
const cabinetMsg = document.getElementById("cabinetMsg");
const expireWarn = document.getElementById("expireWarn");
const copyBtn = document.getElementById("copyConfig");

function authQuery() {
  return `tg_id=${encodeURIComponent(tgId)}${auth ? `&auth=${encodeURIComponent(auth)}` : ""}`;
}

// ---------- тарифы: цены, скидка, выгода ----------
function renderPlans() {
  const one = plans.find(p => p.dataset.months === "1");
  const oneBase = Number(one?.dataset.price) || 0;
  plans.forEach(p => {
    const months = Number(p.dataset.months);
    const base = Number(p.dataset.price);
    const final = discount ? Math.round(base * (1 - discount / 100)) : base;
    p.dataset.final = final;
    p.querySelector("strong").innerHTML = discount ? `<s>${base} ₽</s>${final} ₽` : `${final} ₽`;
    if (months === 1) return;
    let note = p.querySelector(".plan-note");
    if (!note) {
      note = document.createElement("small");
      note.className = "plan-note";
      p.querySelector("div").appendChild(note);
    }
    const perMonth = Math.round(final / months);
    const save = oneBase ? Math.round((1 - base / (oneBase * months)) * 100) : 0;
    note.textContent = `≈ ${perMonth} ₽/мес` + (save > 0 ? ` · −${save}%` : "");
  });
  if (selected) {
    const cur = plans.find(p => p.dataset.months === selected.months);
    if (cur) {
      selected.price = Number(cur.dataset.final);
      price.textContent = selected.price + " ₽";
    }
  }
}

function updateBuyState() {
  if (!selected || !loaded) { buyMsg.textContent = ""; return; }
  const need = selected.price - balance;
  if (need > 0) {
    buyMsg.innerHTML = `Не хватает <b>${need} ₽</b>. <a href="https://t.me/ZUVIXv" target="_blank" rel="noopener">Пополнить через поддержку</a>`;
  } else {
    buyMsg.textContent = "Баланса достаточно — нажмите «Продолжить».";
  }
}

// ---------- личный кабинет ----------
function showUser(data) {
  const display = data?.first_name || user?.first_name || user?.username || "Пользователь Telegram";
  document.getElementById("userName").textContent = display;
  document.getElementById("userId").textContent = `ID: ${data?.tg_id || tgId || "—"}`;
  document.getElementById("avatar").textContent = display.slice(0, 1).toUpperCase();
  balance = Number(data?.balance) || 0;
  discount = Number(data?.discount_percent) || 0;
  document.getElementById("balance").textContent = `${balance} ₽`;
  document.getElementById("discount").textContent = discount ? `${discount}%` : "—";

  const expires = data?.expires_at ? new Date(data.expires_at) : null;
  const active = expires && !Number.isNaN(expires.getTime()) && expires > new Date();
  hasSub = !!active;
  if (active) {
    document.getElementById("subStatus").textContent = "Активна";
    document.getElementById("expires").textContent = expires.toLocaleDateString("ru-RU");
    const days = Math.ceil((expires - new Date()) / 86400000);
    if (days <= 3) {
      expireWarn.textContent = `⚠️ Подписка закончится через ${days === 1 ? "1 день" : days + " дн."} — продлите, чтобы не потерять доступ.`;
      expireWarn.classList.remove("hidden");
    } else {
      expireWarn.classList.add("hidden");
    }
  } else {
    document.getElementById("subStatus").textContent = "Нет активной";
    document.getElementById("expires").textContent = "—";
    expireWarn.classList.add("hidden");
  }
  copyBtn.classList.toggle("hidden", !hasSub);
  renderPlans();
  updateBuyState();
}

function showPayments(payments) {
  const wrap = document.getElementById("payments");
  const list = document.getElementById("paymentsList");
  if (!payments || !payments.length) { wrap.classList.add("hidden"); return; }
  list.innerHTML = payments.map(p => {
    const d = new Date(p.created_at);
    const date = Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("ru-RU");
    return `<div class="payment-row"><div><b>${esc(p.amount)} ₽</b><small>${esc(p.months)} мес. · ${esc(p.method || "оплата")}</small></div><small>${esc(date)}</small></div>`;
  }).join("");
  wrap.classList.remove("hidden");
}

async function loadCabinet() {
  if (!tgId) {
    showUser(null);
    document.getElementById("syncStatus").textContent = "Откройте в Telegram";
    return;
  }
  cabinetEl.classList.add("skeleton");
  try {
    const r = await fetch(`${API_BASE}/user?${authQuery()}`);
    const json = await r.json();
    loaded = !!json.ok;
    showUser(json.user);
    showPayments(json.payments);
    document.getElementById("syncStatus").textContent = json.ok ? "Синхронизировано" : "Ошибка";
  } catch {
    loaded = false;
    showUser(null);
    document.getElementById("syncStatus").textContent = "API недоступен";
  } finally {
    cabinetEl.classList.remove("skeleton");
  }
}

// ---------- копирование ключа ----------
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) throw new Error("copy failed");
  }
}

copyBtn.addEventListener("click", async () => {
  copyBtn.disabled = true;
  cabinetMsg.textContent = "";
  try {
    const r = await fetch(`${API_BASE}/config?${authQuery()}`);
    const json = await r.json();
    if (!json.ok || !json.config) throw new Error(json.message || "no config");
    await copyText(json.config);
    cabinetMsg.textContent = "✓ Ключ скопирован — вставьте его в приложение-клиент.";
    tg?.HapticFeedback?.notificationOccurred("success");
  } catch {
    cabinetMsg.textContent = "Не удалось получить ключ. Откройте бота → «📱 Открыть приложение».";
    tg?.HapticFeedback?.notificationOccurred("error");
  } finally {
    copyBtn.disabled = false;
  }
});

// ---------- выбор тарифа ----------
plans.forEach(p => {
  p.addEventListener("click", () => {
    plans.forEach(x => x.classList.remove("selected"));
    p.classList.add("selected");
    selected = {months: p.dataset.months, price: Number(p.dataset.final || p.dataset.price)};
    price.textContent = selected.price + " ₽";
    continueBtn.disabled = false;
    updateBuyState();
    tg?.HapticFeedback?.selectionChanged();
  });
});

continueBtn.addEventListener("click", () => {
  if (!selected) return;
  if (loaded && selected.price > balance) {
    updateBuyState();
    tg?.HapticFeedback?.notificationOccurred("error");
    return;
  }
  buyMsg.textContent = "Тариф выбран. Оплата через баланс — нажмите «🛒 Купить подписку» в боте.";
  tg?.HapticFeedback?.notificationOccurred("success");
});

// ---------- модальное окно: закрытие свайпом вниз ----------
(function () {
  const box = modal.querySelector(".modal-box");
  let startY = null, dy = 0;
  box.addEventListener("touchstart", e => {
    startY = box.scrollTop === 0 ? e.touches[0].clientY : null;
    dy = 0;
  }, {passive: true});
  box.addEventListener("touchmove", e => {
    if (startY === null) return;
    dy = e.touches[0].clientY - startY;
    if (dy > 0) {
      box.style.transition = "none";
      box.style.transform = `translateY(${dy}px)`;
    }
  }, {passive: true});
  box.addEventListener("touchend", () => {
    box.style.transition = "transform .2s";
    if (startY !== null && dy > 100) modal.classList.add("hidden");
    box.style.transform = "";
    startY = null;
    dy = 0;
  });
})();

promoBtn.addEventListener("click", async () => {
  const code = promo.value.trim().toUpperCase();
  if (!code) return;
  if (!tgId) {
    promoMsg.textContent = "Откройте сайт из Telegram, чтобы активировать промокод.";
    return;
  }
  promoBtn.disabled = true;
  try {
    const r = await fetch(`${API_BASE}/promo`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({tg_id: tgId, code, username: user?.username || "", first_name: user?.first_name || ""})
    });
    const json = await r.json();
    promoMsg.textContent = (json.ok ? "✓ " : "✕ ") + json.message;
    if (json.ok) { promo.value = ""; await loadCabinet(); }
  } catch {
    promoMsg.textContent = "Не удалось связаться с сервером.";
  } finally {
    promoBtn.disabled = false;
  }
});

loadCabinet();

// Deep-links из Telegram-бота: #refund, #bot-policy, #cabinet, #faq, #support, #setup.
const hash = location.hash.replace("#", "");
if (hash === "refund") openDoc("refund");
if (hash === "bot-policy") openDoc("bot-policy");
if (hash === "setup") openDoc("setup");
if (hash === "cabinet") document.getElementById("cabinet")?.scrollIntoView({behavior: "smooth"});
if (hash === "faq") document.getElementById("faq")?.scrollIntoView({behavior: "smooth"});
if (hash === "support") document.getElementById("support")?.scrollIntoView({behavior: "smooth"});