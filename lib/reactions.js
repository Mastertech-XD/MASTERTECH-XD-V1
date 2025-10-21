const fs = require('fs');
const path = require('path');

// Command-specific emoji reactions
const commandReactions = {
    // Media & Download Commands
    'play': '🎵', 'song': '🎶', 'video': '🎬', 'ytmp4': '📹', 'instagram': '📸',
    'facebook': '📘', 'tiktok': '🎵', 'spotify': '🎧', 'lyrics': '📝',
    
    // Image & Sticker Commands
    'sticker': '🖼️', 'simage': '🔄', 'blur': '🌀', 'removebg': '✂️',
    'remini': '✨', 'crop': '🔪', 'tgsticker': '📎', 'meme': '😂',
    'take': '📦', 'emojimix': '🔣', 'igs': '📥', 'igsc': '📥',
    
    // AI Commands
    'gpt': '🤖', 'gemini': '💎', 'imagine': '🎨', 'flux': '🌊', 'sora': '☁️',
    
    // Fun & Games
    'joke': '😂', 'quote': '💭', 'fact': '📚', 'compliment': '💝',
    'insult': '😈', 'flirt': '😘', 'shayari': '📜', 'character': '🔮',
    'wasted': '💀', 'ship': '💑', 'simp': '😍', 'stupid': '🤪',
    'tictactoe': '⭕', 'hangman': '🪢', 'guess': '🔤', 'trivia': '❓',
    'truth': '💯', 'dare': '😈', '8ball': '🎱',
    
    // Group Management
    'ban': '🔨', 'kick': '👢', 'promote': '⬆️', 'demote': '⬇️',
    'mute': '🔇', 'unmute': '🔊', 'warn': '⚠️', 'tagall': '📢',
    'tagnotadmin': '👥', 'hidetag': '👻', 'antilink': '🔗',
    'antibadword': '🚫', 'antitag': '🏷️', 'welcome': '👋',
    'goodbye': '👋', 'setgdesc': '📝', 'setgname': '🏷️',
    'setgpp': '🖼️', 'resetlink': '🔄', 'clear': '🧹',
    
    // Utility Commands
    'ping': '🏓', 'alive': '💚', 'owner': '👑', 'weather': '🌤️',
    'news': '📰', 'tts': '🗣️', 'attp': '🌈', 'groupinfo': '📊',
    'staff': '👮', 'admins': '👑', 'vv': '👀', 'trt': '🌐',
    'ss': '📱', 'jid': '🆔', 'url': '🔗',
    
    // Text & Art Commands
    'metallic': '🔗', 'ice': '❄️', 'snow': '🌨️', 'impressive': '✨',
    'matrix': '💻', 'light': '💡', 'neon': '🔆', 'devil': '😈',
    'purple': '💜', 'thunder': '⚡', 'leaves': '🍃', '1917': '1️⃣9️⃣1️⃣7️⃣',
    'arena': '🎪', 'hacker': '👨‍💻', 'sand': '🏖️', 'blackpink': '🖤💖',
    'glitch': '📺', 'fire': '🔥',
    
    // Owner Commands
    'mode': '⚙️', 'clearsession': '🗑️', 'antidelete': '🚫',
    'cleartmp': '🧹', 'update': '🔄', 'settings': '⚙️',
    'setpp': '🖼️', 'autoreact': '🤖', 'autostatus': '📊',
    'autotyping': '⌨️', 'autoread': '👀', 'anticall': '📵',
    'pmblocker': '🚫', 'setmention': '💬', 'mention': '🔔',
    
    // Default fallback reactions
    'default': ['✨', '⚡', '🔥', '🚀', '🎯', '💫', '🌟', '✅', '🔄', '📥']
};

// Path for storing auto-reaction state
const USER_GROUP_DATA = path.join(__dirname, '../data/userGroupData.json');

// Load auto-reaction state from file
function loadAutoReactionState() {
    try {
        if (fs.existsSync(USER_GROUP_DATA)) {
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA));
            return data.autoReaction || false;
        }
    } catch (error) {
        console.error('Error loading auto-reaction state:', error);
    }
    return false;
}

// Save auto-reaction state to file
function saveAutoReactionState(state) {
    try {
        const data = fs.existsSync(USER_GROUP_DATA) 
            ? JSON.parse(fs.readFileSync(USER_GROUP_DATA))
            : { groups: [], chatbot: {} };
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
    }
}

// Store auto-reaction state
let isAutoReactionEnabled = loadAutoReactionState();

function getCommandReaction(command) {
    // Extract command name (remove prefix if present)
    const cleanCommand = command.replace(/^[.!]/, '').toLowerCase();
    
    // Return specific emoji for command, or random default
    return commandReactions[cleanCommand] || 
           commandReactions.default[Math.floor(Math.random() * commandReactions.default.length)];
}

// Function to add reaction to a command message
async function addCommandReaction(sock, message) {
    try {
        if (!isAutoReactionEnabled || !message?.key?.id) return;
        
        // Extract command from message
        const text = message.message?.conversation || 
                    message.message?.extendedTextMessage?.text || '';
        
        if (!text.startsWith('.') && !text.startsWith('!')) return;
        
        const command = text.split(' ')[0].slice(1); // Remove prefix
        const emoji = getCommandReaction(command);
        
        await sock.sendMessage(message.key.remoteJid, {
            react: {
                text: emoji,
                key: message.key
            }
        });
    } catch (error) {
        console.error('Error adding command reaction:', error);
    }
}

// Function to handle areact command
async function handleAreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *𝗢𝗪𝗡𝗘𝗥 𝗢𝗡𝗟𝗬 𝗖𝗢𝗠𝗠𝗔𝗡𝗗*\n\nThis feature is restricted to the bot owner.',
                quoted: message
            });
            return;
        }

        const args = message.message?.conversation?.split(' ') || [];
        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            isAutoReactionEnabled = true;
            saveAutoReactionState(true);
            await sock.sendMessage(chatId, { 
                text: '✅ *𝗔𝗨𝗧𝗢-𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦 𝗘𝗡𝗔𝗕𝗟𝗘𝗗*\n\nCommand-specific reactions are now active globally.',
                quoted: message
            });
        } else if (action === 'off') {
            isAutoReactionEnabled = false;
            saveAutoReactionState(false);
            await sock.sendMessage(chatId, { 
                text: '✅ *𝗔𝗨𝗧𝗢-𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡𝗦 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗*\n\nCommand reactions have been disabled.',
                quoted: message
            });
        } else {
            const currentState = isAutoReactionEnabled ? '🟢 𝗘𝗡𝗔𝗕𝗟𝗘𝗗' : '🔴 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗';
            await sock.sendMessage(chatId, { 
                text: `⚡ *𝗔𝗨𝗧𝗢-𝗥𝗘𝗔𝗖𝗧𝗜𝗢𝗡 𝗦𝗧𝗔𝗧𝗨𝗦*\n\nStatus: ${currentState}\n\nUsage:\n.areact on - Enable smart reactions\n.areact off - Disable reactions`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling areact command:', error);
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗦𝗬𝗦𝗧𝗘𝗠 𝗘𝗥𝗥𝗢𝗥*\n\nUnable to process auto-reaction settings.',
            quoted: message
        });
    }
}

module.exports = {
    addCommandReaction,
    handleAreactCommand
};