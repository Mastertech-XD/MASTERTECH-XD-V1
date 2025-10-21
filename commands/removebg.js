const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { uploadImage } = require('../lib/uploadImage');

async function getQuotedOrOwnImageUrl(sock, message) {
    // 1) Quoted image (highest priority)
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (quoted?.imageMessage) {
        const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    // 2) Image in the current message
    if (message.message?.imageMessage) {
        const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
        const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const buffer = Buffer.concat(chunks);
        return await uploadImage(buffer);
    }

    return null;
}

module.exports = {
    name: 'removebg',
    alias: ['rmbg', 'nobg'],
    category: 'general',
    desc: 'Remove background from images',
    async exec(sock, message, args) {
        try {
            const chatId = message.key.remoteJid;
            let imageUrl = null;
            
            // Check if args contain a URL
            if (args.length > 0) {
                const url = args.join(' ');
                if (isValidUrl(url)) {
                    imageUrl = url;
                } else {
                    return sock.sendMessage(chatId, { 
                        text: '❌ Invalid URL provided.\n\nUsage: `.removebg https://example.com/image.jpg`' 
                    }, { quoted: message });
                }
            } else {
                // Try to get image from message or quoted message
                imageUrl = await getQuotedOrOwnImageUrl(sock, message);
                
                if (!imageUrl) {
                    return sock.sendMessage(chatId, { 
                        text: '📸 *Remove Background Command*\n\nUsage:\n• `.removebg <image_url>`\n• Reply to an image with `.removebg`\n• Send image with `.removebg`\n\nExample: `.removebg https://example.com/image.jpg`' 
                    }, { quoted: message });
                }
            }

        
            // Call the remove background API
            const apiUrl = `https://api.siputzx.my.id/api/iloveimg/removebg?image=${encodeURIComponent(imageUrl)}`;
            
            const response = await axios.get(apiUrl, {
                responseType: 'arraybuffer',
                timeout: 30000, // 30 second timeout
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });

            if (response.status === 200 && response.data) {
                // Send the processed image
                await sock.sendMessage(chatId, {
                    image: response.data,
                    caption: '✨ *Background removed successfully!*\n\n𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭'
                }, { quoted: message });
            } else {
                throw new Error('Failed to process image');
            }

        } catch (error) {
            console.error('RemoveBG Error:', error.message);
            
            let errorMessage = '🚫 *𝗕𝗔𝗖𝗞𝗚𝗥𝗢𝗨𝗡𝗗 𝗥𝗘𝗠𝗢𝗩𝗔𝗟 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nUnable to process background removal.';

if (error.response?.status === 429) {
    errorMessage = '⏳ *𝗥𝗔𝗧𝗘 𝗟𝗜𝗠𝗜𝗧 𝗘𝗫𝗖𝗘𝗘𝗗𝗘𝗗*\n\nPlease wait before your next removal request.';
} else if (error.response?.status === 400) {
    errorMessage = '🖼️ *𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗜𝗠𝗔𝗚𝗘 𝗙𝗢𝗥𝗠𝗔𝗧*\n\nImage format or URL is not supported.';
} else if (error.response?.status === 500) {
    errorMessage = '🔧 *𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗨𝗡𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘*\n\nBackground removal service is down.';
} else if (error.code === 'ECONNABORTED') {
    errorMessage = '⏰ *𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚 𝗧𝗜𝗠𝗘𝗢𝗨𝗧*\n\nRequest took too long to complete.';
} else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    errorMessage = '🌐 *𝗡𝗘𝗧𝗪𝗢𝗥𝗞 𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡 𝗘𝗥𝗥𝗢𝗥*\n\nCheck your internet connection.';
}
            
            await sock.sendMessage(chatId, { 
                text: errorMessage 
            }, { quoted: message });
        }
    }
};

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
