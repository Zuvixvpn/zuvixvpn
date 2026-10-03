const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

// If the Mini App is hosted separately, replace this with your public bot API URL.
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
    html: `<p>Возврат рассматривается индивидуально с учётом применимого законодательства и фактического состояния цифровой услуги.</p><h3>Если доступ ещё не был предоставлен</h3><p>Пользователь может обратиться в поддержку с запросом на возврат. Заявка рассматривается по обстоятельствам заказа.</p><h3>Если есть техническая проблема</h3><p>Сначала поддержка проверяет проблему и может восстановить доступ. Если услуга не может быть предоставлена по вине сервиса, вопрос о возврате рассматривается отдельно.</p><h3>Что указать в обращении</h3><p>Telegram ID, дату платежа, выбранный тариф и описание проблемы. Не отправляйте данные банковской карты или коды подтверждения.</p><p class="muted">Эти условия являются информационным шаблоном и должны быть проверены владельцем сервиса с учётом применимого законодательства и правил платёжного провайдера.</p>`
  }
};

function openDoc(key) {
  const doc = docs[key];
  if (!doc) return;
  modalTitle.textContent = doc.title;
  modalBody.innerHTML = doc.html;
  modal.classList.remove("hidden");
}

document.querySelectorAll(".doc").forEach(btn => btn.addEventListener("click", () => openDoc(btn.dataset.doc)));
document.getElementById("modalClose").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

function showUser(data) {
  const display = data?.first_name || user?.first_name || user?.username || "Пользователь Telegram";
  document.getElementById("userName").textContent = display;
  document.getElementById("userId").textContent = `ID: ${data?.tg_id || tgId || "—"}`;
  document.getElementById("avatar").textContent = display.slice(0, 1).toUpperCase();
  const expires = data?.expires_at ? new Date(data.expires_at) : null;
  if (expires && !Number.isNaN(expires.getTime()) && expires > new Date()) {
    document.getElementById("subStatus").textContent = "Активна";
    document.getElementById("expires").textContent = expires.toLocaleDateString("ru-RU");
  } else {
    document.getElementById("subStatus").textContent = "Нет активной";
    document.getElementById("expires").textContent = "—";
  }
}

async function loadCabinet() {
  if (!tgId) {
    showUser(null);
    document.getElementById("syncStatus").textContent = "Откройте в Telegram";
    return;
  }
  try {
    const r = await fetch(`${API_BASE}/user?tg_id=${encodeURIComponent(tgId)}`);
    const json = await r.json();
    showUser(json.user);
    document.getElementById("syncStatus").textContent = json.ok ? "Синхронизировано" : "Ошибка";
  } catch {
    showUser(null);
    document.getElementById("syncStatus").textContent = "API недоступен";
  }
}

plans.forEach(p => {
  p.addEventListener("click", () => {
    plans.forEach(x => x.classList.remove("selected"));
    p.classList.add("selected");
    selected = {months: p.dataset.months, price: p.dataset.price};
    price.textContent = selected.price + " ₽";
    continueBtn.disabled = false;
    tg?.HapticFeedback?.selectionChanged();
  });
});

continueBtn.addEventListener("click", () => {
  if (!selected) return;
  promoMsg.textContent = "Тариф выбран. Оплата будет подключена в этом разделе позже.";
  tg?.HapticFeedback?.notificationOccurred("success");
});

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
    if (json.ok) await loadCabinet();
  } catch {
    promoMsg.textContent = "Не удалось связаться с сервером.";
  } finally {
    promoBtn.disabled = false;
  }
});

loadCabinet();

// Deep-links from the Telegram bot: #refund, #bot-policy, #cabinet.
const hash = location.hash.replace("#", "");
if (hash === "refund") openDoc("refund");
if (hash === "bot-policy") openDoc("bot-policy");
if (hash === "cabinet") document.getElementById("cabinet")?.scrollIntoView({behavior: "smooth"});
