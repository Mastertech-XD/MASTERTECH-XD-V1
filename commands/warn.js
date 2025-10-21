const fs = require('fs');
const path = require('path');
const isAdmin = require('../lib/isAdmin');

// Define paths
const databaseDir = path.join(process.cwd(), 'data');
const warningsPath = path.join(databaseDir, 'warnings.json');

// Initialize warnings file if it doesn't exist
function initializeWarningsFile() {
    // Create database directory if it doesn't exist
    if (!fs.existsSync(databaseDir)) {
        fs.mkdirSync(databaseDir, { recursive: true });
    }
    
    // Create warnings.json if it doesn't exist
    if (!fs.existsSync(warningsPath)) {
        fs.writeFileSync(warningsPath, JSON.stringify({}), 'utf8');
    }
}

async function warnCommand(sock, chatId, senderId, mentionedJids, message) {
    try {
        // Initialize files first
        initializeWarningsFile();

        // First check if it's a group
        if (!chatId.endsWith('@g.us')) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗢𝗡𝗟𝗬*\n\nThis command is designed for group administration.'
            }, { quoted: message });
            return;
        }

        // Check admin status first
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
        } catch (adminError) {
            console.error('Error checking admin status:', adminError);
            await sock.sendMessage(chatId, { 
                text: '🚫 *𝗣𝗘𝗥𝗠𝗜𝗦𝗦𝗜𝗢𝗡 𝗘𝗥𝗥𝗢𝗥*\n\nPlease ensure the bot has admin privileges in this group.'
            }, { quoted: message });
            return;
        }

        let userToWarn;
        
        // Check for mentioned users
        if (mentionedJids && mentionedJids.length > 0) {
            userToWarn = mentionedJids[0];
        }
        // Check for replied message
        else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
            userToWarn = message.message.extendedTextMessage.contextInfo.participant;
        }
        
        if (!userToWarn) {
            await sock.sendMessage(chatId, { 
                text: '👤 *𝗨𝗦𝗘𝗥 𝗦𝗣𝗘𝗖𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗*\n\nPlease mention the user or reply to their message to issue a warning.'
            }, { quoted: message });
            return;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Read warnings, create empty object if file is empty
            let warnings = {};
            try {
                warnings = JSON.parse(fs.readFileSync(warningsPath, 'utf8'));
            } catch (error) {
                warnings = {};
            }

            // Initialize nested objects if they don't exist
            if (!warnings[chatId]) warnings[chatId] = {};
            if (!warnings[chatId][userToWarn]) warnings[chatId][userToWarn] = 0;
            
            warnings[chatId][userToWarn]++;
            fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));

            const warningMessage = `╔═══✦⋅■ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚 𝗔𝗟𝗘𝗥𝗧 ⋅■✦═══╗

║  🚨 𝗨𝗦𝗘𝗥: @${userToWarn.split('@')[0]}
║  ⚠️ 𝗪𝗔𝗥𝗡𝗜𝗡𝗚𝗦: ${warnings[chatId][userToWarn]}/3
║  👑 𝗕𝗬: @${senderId.split('@')[0]}
║  🕒 ${new Date().toLocaleString()}
║
║  ⚠️ 𝗡𝗘𝗫𝗧 𝗩𝗜𝗢𝗟𝗔𝗧𝗜𝗢𝗡 = 𝗥𝗘𝗠𝗢𝗩𝗔𝗟

╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`;

            await sock.sendMessage(chatId, { 
                text: warningMessage,
                mentions: [userToWarn, senderId]
            }, { quoted: message });

            // Auto-kick after 3 warnings
            if (warnings[chatId][userToWarn] >= 3) {
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

                await sock.groupParticipantsUpdate(chatId, [userToWarn], "remove");
                delete warnings[chatId][userToWarn];
                fs.writeFileSync(warningsPath, JSON.stringify(warnings, null, 2));
                
                const kickMessage = `🚫 *𝗔𝗨𝗧𝗢-𝗞𝗜𝗖𝗞 𝗘𝗫𝗘𝗖𝗨𝗧𝗘𝗗*\n\n` +
                    `@${userToWarn.split('@')[0]} has been removed after reaching 3 warnings. ⚠️\n\n` +
                    `_MASTERTECH-XD V1 Security System_`;

                await sock.sendMessage(chatId, { 
                    text: kickMessage,
                    mentions: [userToWarn]
                }, { quoted: message });
            }
        } catch (error) {
            console.error('Error in warn command:', error);
            await sock.sendMessage(chatId, { 
                text: '🚫 *𝗪𝗔𝗥𝗡𝗜𝗡𝗚 𝗙𝗔𝗜𝗟𝗘𝗗*\n\nUnable to process warning at this time.'
            }, { quoted: message });
        }
    } catch (error) {
        console.error('Error in warn command:', error);
        if (error.data === 429) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            try {
                await sock.sendMessage(chatId, { 
                    text: '⏳ *𝗥𝗔𝗧𝗘 𝗟𝗜𝗠𝗜𝗧 𝗛𝗜𝗧*\n\nPlease wait before attempting this action again.'
                }, { quoted: message });
            } catch (retryError) {
                console.error('Error sending retry message:', retryError);
            }
        } else {
            try {
                await sock.sendMessage(chatId, { 
                    text: '🚫 *𝗦𝗬𝗦𝗧𝗘𝗠 𝗘𝗥𝗥𝗢𝗥*\n\nUnable to process warning. Verify bot permissions.'
                }, { quoted: message });
            } catch (sendError) {
                console.error('Error sending error message:', sendError);
            }
        }
    }
}

module.exports = warnCommand;