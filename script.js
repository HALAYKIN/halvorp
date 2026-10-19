'use strict';

const SERVER_IP  = '37.27.166.65:25920';
const API_URL    = `https://api.mcsrvstat.us/3/${SERVER_IP}`;
const REFRESH_MS = 60000;

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
}

async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (e) {}
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
}

// --- МОНИТОРИНГ ---
let statusIntervalId = null;

async function updateMinecraftStatus() {
    const statusText = document.getElementById('server-status');
    const onlineText = document.getElementById('server-online');
    if (!statusText || !onlineText) return;

    try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        if (data.online) {
            statusText.textContent = 'В сети';
            statusText.className = 'online';
            onlineText.textContent = data.players ? `${data.players.online} / ${data.players.max}` : '—';
        } else {
            statusText.textContent = 'Выключен';
            statusText.className = 'offline';
            onlineText.textContent = '0 / 0';
        }
    } catch (error) {
        statusText.textContent = 'Ошибка';
        statusText.className = 'offline';
        onlineText.textContent = '—';
    }
}

function startStatusPolling() {
    updateMinecraftStatus();
    if (statusIntervalId) clearInterval(statusIntervalId);
    statusIntervalId = setInterval(updateMinecraftStatus, REFRESH_MS);
}

// --- КОПИРОВАНИЕ IP ---
function initIpCopy() {
    const btn = document.getElementById('ipCopyBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        const ok = await copyToClipboard(SERVER_IP);
        showToast(ok ? '✅ IP скопирован!' : '❌ Ошибка', ok ? 'success' : 'error');
    });
}

// --- АНКЕТА (ФОРМА) ---
function generateApplication(event) {
    event.preventDefault(); // Отменяем перезагрузку страницы

    const name     = document.getElementById('playerName').value.trim();
    const age      = document.getElementById('playerAge').value.trim();
    const fraction = document.getElementById('targetFraction').value;
    const bio      = document.getElementById('playerBio').value.trim();

    // Проверка на пустые поля
    if (!name || !age || !bio) {
        showToast('Заполните все поля!', 'error');
        return;
    }

    const applicationTemplate = 
`ЗАЯВЛЕНИЕ НА ВСТУПЛЕНИЕ В ОРГАНИЗАЦИЮ
-----------------------------------------
Имя персонажа (Nick_Name): ${name}
Игровой возраст (лет в Халайкинграде): ${age}
Желаемая фракция: ${fraction}
Краткая биография персонажа: ${bio}
-----------------------------------------
Сгенерировано автоматически на сайте HalvoRP.`;

    const outputText = document.getElementById('outputText');
    const resultBox  = document.getElementById('resultBox');
    
    if (outputText && resultBox) {
        outputText.value = applicationTemplate;
        resultBox.classList.remove('hidden');
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

async function copyResultText() {
    const outputText = document.getElementById('outputText');
    if (!outputText) return;
    const ok = await copyToClipboard(outputText.value);
    showToast(ok ? '📋 Заявление скопировано!' : '❌ Ошибка', ok ? 'success' : 'error');
}

// --- БУРГЕР МЕНЮ ---
function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const links  = document.getElementById('navLinks');
    if (!toggle || !links) return;

    toggle.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
}

// --- ЗАПУСК ВСЕГО ---
document.addEventListener('DOMContentLoaded', () => {
    initIpCopy();
    initNavToggle();
    
    const form = document.getElementById('fractionForm');
    if (form) form.addEventListener('submit', generateApplication);

    const copyBtn = document.getElementById('copyFormBtn');
    if (copyBtn) copyBtn.addEventListener('click', copyResultText);

    startStatusPolling();
});