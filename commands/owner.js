const settings = require('../settings');

async function ownerCommand(sock, chatId, message) {
    const vcard = `
BEGIN:VCARD
VERSION:3.0
FN:${settings.botOwner}
TEL;waid=${settings.ownerNumber}:${settings.ownerNumber}
END:VCARD
`;

    await sock.sendMessage(chatId, {
        contacts: { 
            displayName: settings.botOwner, 
            contacts: [{ vcard }] 
        },
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363393631540851@newsletter',
                newsletterName: 'MASTERTECH-XD V1',
                serverMessageId: -1
            }
        }
    }, { 
        quoted: message 
    });
}

module.exports = ownerCommand;