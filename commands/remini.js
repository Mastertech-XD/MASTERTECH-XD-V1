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

async function reminiCommand(sock, chatId, message, args) {
    try {
        let imageUrl = null;
        
        // Check if args contain a URL
        if (args.length > 0) {
            const url = args.join(' ');
            if (isValidUrl(url)) {
                imageUrl = url;
            } else {
                return sock.sendMessage(chatId, { 
                    text: '❌ Invalid URL provided.\n\nUsage: `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
            }
        } else {
            // Try to get image from message or quoted message
            imageUrl = await getQuotedOrOwnImageUrl(sock, message);
            
            if (!imageUrl) {
                return sock.sendMessage(chatId, { 
                    text: '📸 *Remini AI Enhancement Command*\n\nUsage:\n• `.remini <image_url>`\n• Reply to an image with `.remini`\n• Send image with `.remini`\n\nExample: `.remini https://example.com/image.jpg`' 
                }, { quoted: message });
            }
        }

        // Call the Remini API
        const apiUrl = `https://api.princetechn.com/api/tools/remini?apikey=prince_tech_api_azfsbshfb&url=${encodeURIComponent(imageUrl)}`;
        
        const response = await axios.get(apiUrl, {
            timeout: 60000, // 60 second timeout (AI processing takes longer)
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });


        if (response.data && response.data.success && response.data.result) {
            const result = response.data.result;
            
            if (result.image_url) {
                // Download the enhanced image
                const imageResponse = await axios.get(result.image_url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                
                if (imageResponse.status === 200 && imageResponse.data) {
                    // Send the enhanced image
                    await sock.sendMessage(chatId, {
                        image: imageResponse.data,
                        caption: '✨ *Image enhanced successfully!*\n\n𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭'
                    }, { quoted: message });
                } else {
                    throw new Error('Failed to download enhanced image');
                }
            } else {
                throw new Error(result.message || 'Failed to enhance image');
            }
        } else {
            throw new Error('API returned invalid response');
        }

    } catch (error) {
        console.error('Remini Error:', error.message);
        
        let errorMessage = '🚫 *𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗠𝗘𝗡𝗧 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nImage enhancement process was unsuccessful.';

if (error.response?.status === 429) {
    errorMessage = '⏳ *𝗥𝗔𝗧𝗘 𝗟𝗜𝗠𝗜𝗧 𝗛𝗜𝗧*\n\nPlease wait before your next enhancement request.';
} else if (error.response?.status === 400) {
    errorMessage = '🖼️ *𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗜𝗠𝗔𝗚𝗘*\n\nImage format or URL is not supported.';
} else if (error.response?.status === 500) {
    errorMessage = '🔧 *𝗦𝗘𝗥𝗩𝗜𝗖𝗘 𝗗𝗢𝗪𝗡*\n\nEnhancement service is temporarily unavailable.';
} else if (error.code === 'ECONNABORTED') {
    errorMessage = '⏰ *𝗧𝗜𝗠𝗘𝗢𝗨𝗧 𝗘𝗥𝗥𝗢𝗥*\n\nRequest took too long to process.';
} else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
    errorMessage = '🌐 *𝗖𝗢𝗡𝗡𝗘𝗖𝗧𝗜𝗢𝗡 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nNetwork connection issue detected.';
} else if (error.message.includes('Error processing image')) {
    errorMessage = '🎨 *𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚 𝗘𝗥𝗥𝗢𝗥*\n\nTry with a different image file.';
    
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

// Helper function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

module.exports = { reminiCommand };
