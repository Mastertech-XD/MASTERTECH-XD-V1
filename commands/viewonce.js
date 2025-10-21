const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function viewonceCommand(sock, chatId, message) {
    // Extract quoted imageMessage or videoMessage from your structure
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedImage = quoted?.imageMessage;
    const quotedVideo = quoted?.videoMessage;

    if (quotedImage && quotedImage.viewOnce) {
        // Download and send the image
        const stream = await downloadContentFromMessage(quotedImage, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { 
            image: buffer, 
            fileName: 'media.jpg', 
            caption: quotedImage.caption || '🖼️ *𝗩𝗜𝗘𝗪-𝗢𝗡𝗖𝗘 𝗜𝗠𝗔𝗚𝗘*\n\n𝗥𝗘𝗩𝗘𝗔𝗟𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭'
        }, { quoted: message });
    } else if (quotedVideo && quotedVideo.viewOnce) {
        // Download and send the video
        const stream = await downloadContentFromMessage(quotedVideo, 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        await sock.sendMessage(chatId, { 
            video: buffer, 
            fileName: 'media.mp4', 
            caption: quotedVideo.caption || '🎬 *𝗩𝗜𝗘𝗪-𝗢𝗡𝗖𝗘 𝗩𝗜𝗗𝗘𝗢*\n\n𝗥𝗘𝗩𝗘𝗔𝗟𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭'
        }, { quoted: message });
    } else {
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗩𝗜𝗘𝗪-𝗢𝗡𝗖𝗘 𝗘𝗥𝗥𝗢𝗥*\n\nPlease reply to a view-once image or video message.' 
        }, { quoted: message });
    }
}

module.exports = viewonceCommand;