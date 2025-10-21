const isAdmin = require('../lib/isAdmin');

async function tagAllCommand(sock, chatId, senderId, message) {
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

        // Get group metadata
        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;

        if (!participants || participants.length === 0) {
            await sock.sendMessage(chatId, { 
                text: '👥 *𝗡𝗢 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 𝗙𝗢𝗨𝗡𝗗*\n\nNo participants available in this group.' 
            }, { quoted: message });
            return;
        }

        // Create message with each member on a new line
        let messageText = `╔═══✦⋅■ 𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗧𝗜𝗢𝗡 ⋅■✦═══╗\n\n` +
                         `🌟 𝗛𝗘𝗟𝗟𝗢 𝗕𝗘𝗟𝗢𝗩𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦!\n\n` +
                         `📢 𝗜𝗠𝗣𝗢𝗥𝗧𝗔𝗡𝗧 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗙𝗢𝗥 𝗔𝗟𝗟\n\n` +
                         `👥 𝗧𝗔𝗚𝗚𝗘𝗗 𝗠𝗘𝗠𝗕𝗘𝗥𝗦:\n\n`;

        participants.forEach(participant => {
            messageText += `║  👤 @${participant.id.split('@')[0]}\n`;
        });

        messageText += `\n╚═══✦⋅■ 𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`;

        // Send message with mentions
        await sock.sendMessage(chatId, {
            text: messageText,
            mentions: participants.map(p => p.id)
        }, { quoted: message });

    } catch (error) {
        console.error('Error in tagall command:', error);
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗠𝗘𝗡𝗧𝗜𝗢𝗡 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nUnable to tag group members at this time.' 
        }, { quoted: message });
    }
}

module.exports = tagAllCommand;