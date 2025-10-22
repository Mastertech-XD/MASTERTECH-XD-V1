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
            const data = JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
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
        let data = {};
        if (fs.existsSync(USER_GROUP_DATA)) {
            data = JSON.parse(fs.readFileSync(USER_GROUP_DATA, 'utf8'));
        }
        
        data.autoReaction = state;
        fs.writeFileSync(USER_GROUP_DATA, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving auto-reaction state:', error);
        return false;
    }
}

// Store auto-reaction state
let isAutoReactionEnabled = loadAutoReactionState();

// Function to extract command from message
function extractCommand(message) {
    try {
        // Check different message types
        let text = '';
        
        if (message.message?.conversation) {
            text = message.message.conversation;
        } else if (message.message?.extendedTextMessage?.text) {
            text = message.message.extendedTextMessage.text;
        } else if (message.message?.imageMessage?.caption) {
            text = message.message.imageMessage.caption;
        } else if (message.message?.videoMessage?.caption) {
            text = message.message.videoMessage.caption;
        } else {
            return null;
        }

        // Check if message starts with command prefix
        if (!text.startsWith('.') && !text.startsWith('!')) {
            return null;
        }

        // Extract command (first word without prefix)
        const commandMatch = text.trim().match(/^[.!](\w+)/);
        return commandMatch ? commandMatch[1].toLowerCase() : null;
        
    } catch (error) {
        console.error('Error extracting command:', error);
        return null;
    }
}

function getCommandReaction(command) {
    if (!command) {
        return commandReactions.default[Math.floor(Math.random() * commandReactions.default.length)];
    }
    
    return commandReactions[command] || 
           commandReactions.default[Math.floor(Math.random() * commandReactions.default.length)];
}

// Function to add reaction to a command message
async function addCommandReaction(sock, message) {
    try {
        if (!isAutoReactionEnabled || !message?.key?.remoteJid || !message?.key?.id) {
            return;
        }

        // Extract command from message
        const command = extractCommand(message);
        if (!command) return;

        const emoji = getCommandReaction(command);
        
        console.log(`Adding reaction ${emoji} for command: ${command}`);
        
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

// Function to handle autoreact command
async function handleAutoreactCommand(sock, chatId, message, isOwner) {
    try {
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '🚫 *OWNER ONLY COMMAND*\n\nThis feature is restricted to the bot owner.',
                quoted: message
            });
            return;
        }

        // Extract arguments properly
        let args = [];
        if (message.message?.conversation) {
            args = message.message.conversation.split(' ');
        } else if (message.message?.extendedTextMessage?.text) {
            args = message.message.extendedTextMessage.text.split(' ');
        }

        const action = args[1]?.toLowerCase();

        if (action === 'on') {
            isAutoReactionEnabled = true;
            const saved = saveAutoReactionState(true);
            
            await sock.sendMessage(chatId, { 
                text: saved ? 
                    '✅ *AUTO-REACTIONS ENABLED*\n\nCommand-specific reactions are now active globally.' :
                    '⚠️ *AUTO-REACTIONS ENABLED*\n\nNote: Settings may not persist after restart.',
                quoted: message
            });
            
        } else if (action === 'off') {
            isAutoReactionEnabled = false;
            const saved = saveAutoReactionState(false);
            
            await sock.sendMessage(chatId, { 
                text: saved ? 
                    '✅ *AUTO-REACTIONS DISABLED*\n\nCommand reactions have been disabled.' :
                    '⚠️ *AUTO-REACTIONS DISABLED*\n\nNote: Settings may not persist after restart.',
                quoted: message
            });
            
        } else {
            // Show current status
            const currentState = isAutoReactionEnabled ? '🟢 ENABLED' : '🔴 DISABLED';
            await sock.sendMessage(chatId, { 
                text: `⚡ *AUTO-REACTION STATUS*\n\nStatus: ${currentState}\n\nUsage:\n• .autoreact on - Enable smart reactions\n• .autoreact off - Disable reactions\n\nCurrently tracking ${Object.keys(commandReactions).length - 1} commands with custom reactions.`,
                quoted: message
            });
        }
    } catch (error) {
        console.error('Error handling autoreact command:', error);
        await sock.sendMessage(chatId, { 
            text: '🚫 *SYSTEM ERROR*\n\nUnable to process auto-reaction settings. Check console for details.',
            quoted: message
        });
    }
}

// Export functions
module.exports = {
    addCommandReaction,
    handleAutoreactCommand, // Changed from handleAreactCommand
    isAutoReactionEnabled: () => isAutoReactionEnabled,
    
    // Debug function to check command extraction
    debugExtractCommand: extractCommand
};
