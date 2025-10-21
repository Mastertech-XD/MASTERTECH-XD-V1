const fs = require('fs');

const PMBLOCKER_PATH = './data/pmblocker.json';

function readState() {
    try {
        if (!fs.existsSync(PMBLOCKER_PATH)) return { enabled: false, message: '🚫 *Direct Message Restriction*\n\nPrivate messaging is currently disabled.\nPlease contact me through group chats only.\n\n_MASTERTECH-XD V1 Security System_' };
        const raw = fs.readFileSync(PMBLOCKER_PATH, 'utf8');
        const data = JSON.parse(raw || '{}');
        return {
            enabled: !!data.enabled,
            message: typeof data.message === 'string' && data.message.trim() ? data.message : '🚫 *Direct Message Restriction*\n\nPrivate messaging is currently disabled.\nPlease contact me through group chats only.\n\n_MASTERTECH-XD V1 Security System_'
        };
    } catch {
        return { enabled: false, message: '🚫 *Direct Message Restriction*\n\nPrivate messaging is currently disabled.\nPlease contact me through group chats only.\n\n_MASTERTECH-XD V1 Security System_' };
    }
}

function writeState(enabled, message) {
    try {
        if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });
        const current = readState();
        const payload = {
            enabled: !!enabled,
            message: typeof message === 'string' && message.trim() ? message : current.message
        };
        fs.writeFileSync(PMBLOCKER_PATH, JSON.stringify(payload, null, 2));
    } catch {}
}

async function pmblockerCommand(sock, chatId, message, args) {
    const argStr = (args || '').trim();
    const [sub, ...rest] = argStr.split(' ');
    const state = readState();

    if (!sub || !['on', 'off', 'status', 'setmsg'].includes(sub.toLowerCase())) {
        await sock.sendMessage(chatId, { 
            text: `🔒 *PM Blocker Configuration*\n\n*Commands:*\n• .pmblocker on - Enable protection\n• .pmblocker off - Disable protection\n• .pmblocker status - Current settings\n• .pmblocker setmsg <text> - Custom message\n\n_MASTERTECH-XD V1 Security Module_` 
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'status') {
        await sock.sendMessage(chatId, { 
            text: `📊 *PM Blocker Status*\n\n• Status: ${state.enabled ? '🟢 ACTIVE' : '🔴 INACTIVE'}\n• Message: ${state.message}\n\n_MASTERTECH-XD V1 Security System_` 
        }, { quoted: message });
        return;
    }

    if (sub.toLowerCase() === 'setmsg') {
        const newMsg = rest.join(' ').trim();
        if (!newMsg) {
            await sock.sendMessage(chatId, { 
                text: '📝 *Message Configuration*\n\nUsage: .pmblocker setmsg <your_custom_message>' 
            }, { quoted: message });
            return;
        }
        writeState(state.enabled, newMsg);
        await sock.sendMessage(chatId, { 
            text: '✅ *Message Updated*\n\nPM blocker notification message has been successfully configured.' 
        }, { quoted: message });
        return;
    }

    const enable = sub.toLowerCase() === 'on';
    writeState(enable);
    await sock.sendMessage(chatId, { 
        text: `⚡ *PM Blocker ${enable ? 'ACTIVATED' : 'DEACTIVATED'}*\n\nDirect message protection is now ${enable ? 'enabled' : 'disabled'}.\n\n_MASTERTECH-XD V1 Security System_` 
    }, { quoted: message });
}

module.exports = { pmblockerCommand, readState };