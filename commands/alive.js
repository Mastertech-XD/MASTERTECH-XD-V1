const settings = require("../settings");
async function aliveCommand(sock, chatId, message) {
    try {
        const message1 = `◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤◢◤
     🚀 *MASTERTECH-XD V1* 🌟
         *SYSTEM DEPLOYED*
◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥◣◥

🛰️  *MISSION CONTROL*
┌─✦ *Core Version:* ${settings.version}
├─✦ *Status:* 🟢 **OPERATIONAL**
├─✦ *Access Level:* PUBLIC
└─✦ *Power:* ⚡ **MAXIMUM**

🎇 *QUANTUM MODULES ONLINE*
├─ 🌌 **Cosmic Management**
├─ 🔥 **Inferno Antilink Shield**
├─ 🎯 **Precision Fun Matrix**
├─ ⚡ **Lightning Utilities**
├─ 🎨 **Artistic Media Suite**
└─ 🛡️  **Guardian Protection**

✨ *COMMAND INTERFACE*
╰─➤ Type *.menu* for **Galactic Command List**
╰─➤ Type *.help* for **Stellar Support**

🌠 *MasterTech-XD V1 - Beyond Imagination*`;

        await sock.sendMessage(chatId, {
            text: message1,
            contextInfo: {
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363393631540851@newsletter',
                    newsletterName: 'MASTERTECH-XD V1',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    } catch (error) {
        console.error('Error in alive command:', error);
        await sock.sendMessage(chatId, { text: 'MASTERTECH-XD V1 is alive and running!' }, { quoted: message });
    }
}

module.exports = aliveCommand;