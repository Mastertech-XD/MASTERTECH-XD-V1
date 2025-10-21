const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function wastedCommand(sock, chatId, message) {
    let userToWaste;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToWaste = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToWaste = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToWaste) {
        await sock.sendMessage(chatId, { 
            text: '🎯 *𝗨𝗦𝗘𝗥 𝗦𝗣𝗘𝗖𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗*\n\nPlease mention someone or reply to their message to apply the wasted effect!', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToWaste, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image if no profile pic
        }

        // Get the wasted effect image
        const wastedResponse = await axios.get(
            `https://some-random-api.com/canvas/overlay/wasted?avatar=${encodeURIComponent(profilePic)}`,
            { responseType: 'arraybuffer' }
        );

        // Send the wasted image
        await sock.sendMessage(chatId, {
            image: Buffer.from(wastedResponse.data),
            caption: `╔═══✦⋅■ 𝗪𝗔𝗦𝗧𝗘𝗗 𝗘𝗙𝗙𝗘𝗖𝗧 ⋅■✦═══╗\n\n` +
                     `⚰️  @${userToWaste.split('@')[0]}\n\n` +
                     `💀 𝗥𝗘𝗦𝗧 𝗜𝗡 𝗣𝗜𝗘𝗖𝗘𝗦!\n\n` +
                     `╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`,
            mentions: [userToWaste],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in wasted command:', error);
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗪𝗔𝗦𝗧𝗘𝗗 𝗘𝗙𝗙𝗘𝗖𝗧 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nUnable to create wasted image at this time.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = wastedCommand;