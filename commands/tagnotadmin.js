const isAdmin = require('../lib/isAdmin');

async function tagNotAdminCommand(sock, chatId, senderId, message) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *𝗕𝗢𝗧 𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗*\n\nPlease grant admin privileges to the bot first.' 
            }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { 
                text: '🔒 *𝗔𝗗𝗠𝗜𝗡 𝗔𝗖𝗖𝗘𝗦𝗦 𝗢𝗡𝗟𝗬*\n\nThis command is restricted to group administrators.' 
            }, { quoted: message });
            return;
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants || [];

        const nonAdmins = participants.filter(p => !p.admin).map(p => p.id);
        if (nonAdmins.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '👥 *𝗔𝗟𝗟 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 𝗔𝗥𝗘 𝗔𝗗𝗠𝗜𝗡𝗦*\n\nNo regular members available to tag.' 
            }, { quoted: message });
            return;
        }

        let text = `╔═══✦⋅■ 𝗠𝗘𝗠𝗕𝗘𝗥 𝗠𝗘𝗡𝗧𝗜𝗢𝗡 ⋅■✦═══╗\n\n` +
                   `🌟 𝗛𝗘𝗟𝗟𝗢 𝗕𝗘𝗟𝗢𝗩𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦!\n\n` +
                   `📢 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗙𝗢𝗥 𝗥𝗘𝗚𝗨𝗟𝗔𝗥 𝗠𝗘𝗠𝗕𝗘𝗥𝗦\n\n` +
                   `👥 𝗧𝗔𝗚𝗚𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦:\n\n`;

        nonAdmins.forEach(jid => {
            text += `║  👤 @${jid.split('@')[0]}\n`;
        });

        text += `\n╚═══✦⋅■ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`;

        await sock.sendMessage(chatId, { text, mentions: nonAdmins }, { quoted: message });
    } catch (error) {
        console.error('Error in tagnotadmin command:', error);
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗠𝗘𝗠𝗕𝗘𝗥 𝗠𝗘𝗡𝗧𝗜𝗢𝗡 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nUnable to tag regular members at this time.' 
        }, { quoted: message });
    }
}

module.exports = tagNotAdminCommand;