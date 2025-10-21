const isAdmin = require('../lib/isAdmin');
const store = require('../lib/lightweight_store');

async function deleteCommand(sock, chatId, message, senderId) {
    try {
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { text: '🔒 I require admin privileges to delete messages.' }, { quoted: message });
            return;
        }

        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '🔒 This command is restricted to group administrators.' }, { quoted: message });
            return;
        }

        // Determine target user and count
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const parts = text.trim().split(/\s+/);
        let countArg = null;
        
        // Check if a number is provided
        if (parts.length > 1) {
            const maybeNum = parseInt(parts[1], 10);
            if (!isNaN(maybeNum) && maybeNum > 0) {
                countArg = Math.min(maybeNum, 50);
            }
        }
        
        // Check if user is replying to a message
        const ctxInfo = message.message?.extendedTextMessage?.contextInfo || {};
        const repliedParticipant = ctxInfo.participant || null;
        const mentioned = Array.isArray(ctxInfo.mentionedJid) && ctxInfo.mentionedJid.length > 0 ? ctxInfo.mentionedJid[0] : null;
        
        // If no number provided but replying to a message, default to 1
        if (countArg === null && repliedParticipant) {
            countArg = 1;
        }
        // If no number provided and not replying/mentioning, show usage message
        else if (countArg === null && !repliedParticipant && !mentioned) {
            await sock.sendMessage(chatId, { 
                text: '📝 *Message Deletion Command*\n\nPlease specify the number of messages to delete:\n\n▸ `.del 5` - Delete last 5 group messages\n▸ `.del 3 @user` - Delete 3 messages from user\n▸ `.del 2` (reply) - Delete 2 messages from replied user' 
            }, { quoted: message });
            return;
        }
        // If no number provided but mentioning a user, default to 1
        else if (countArg === null && mentioned) {
            countArg = 1;
        }

        // Determine target user: replied > mentioned; if neither, delete last N messages from group
        let targetUser = null;
        let repliedMsgId = null;
        let deleteGroupMessages = false;
        
        if (repliedParticipant && ctxInfo.stanzaId) {
            targetUser = repliedParticipant;
            repliedMsgId = ctxInfo.stanzaId;
        } else if (mentioned) {
            targetUser = mentioned;
        } else {
            // No user mentioned or replied to - delete last N messages from group
            deleteGroupMessages = true;
        }

        // Gather last N messages from targetUser in this chat
        const chatMessages = Array.isArray(store.messages[chatId]) ? store.messages[chatId] : [];
        // Newest last; we traverse from end backwards
        const toDelete = [];
        const seenIds = new Set();

        if (deleteGroupMessages) {
            // Delete last N messages from group (any user)
            for (let i = chatMessages.length - 1; i >= 0 && toDelete.length < countArg; i--) {
                const m = chatMessages[i];
                if (!seenIds.has(m.key.id)) {
                    // skip protocol/system messages, bot's own messages, and the current command message
                    if (!m.message?.protocolMessage && 
                        !m.key.fromMe && 
                        m.key.id !== message.key.id) {
                        toDelete.push(m);
                        seenIds.add(m.key.id);
                    }
                }
            }
        } else {
            // Original logic for specific user
            // If replying, prioritize deleting the exact replied message first (counts toward N)
            if (repliedMsgId) {
                const repliedInStore = chatMessages.find(m => m.key.id === repliedMsgId && (m.key.participant || m.key.remoteJid) === targetUser);
                if (repliedInStore) {
                    toDelete.push(repliedInStore);
                    seenIds.add(repliedInStore.key.id);
                } else {
                    // If not found in store, still attempt delete directly
                    try {
                        await sock.sendMessage(chatId, {
                            delete: {
                                remoteJid: chatId,
                                fromMe: false,
                                id: repliedMsgId,
                                participant: repliedParticipant
                            }
                        });
                        // Count this as one deleted and reduce required count
                        countArg = Math.max(0, countArg - 1);
                    } catch {}
                }
            }
            for (let i = chatMessages.length - 1; i >= 0 && toDelete.length < countArg; i--) {
                const m = chatMessages[i];
                const participant = m.key.participant || m.key.remoteJid;
                if (participant === targetUser && !seenIds.has(m.key.id)) {
                    // skip protocol/system messages
                    if (!m.message?.protocolMessage) {
                        toDelete.push(m);
                        seenIds.add(m.key.id);
                    }
                }
            }
        }

        if (toDelete.length === 0) {
            const errorMsg = deleteGroupMessages 
                ? '📭 No recent messages available for deletion in this group.' 
                : '📭 No recent messages found from the specified user.';
            await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
            return;
        }

        // Delete sequentially with small delay
        for (const m of toDelete) {
            try {
                const msgParticipant = deleteGroupMessages 
                    ? (m.key.participant || m.key.remoteJid) 
                    : (m.key.participant || targetUser);
                await sock.sendMessage(chatId, {
                    delete: {
                        remoteJid: chatId,
                        fromMe: false,
                        id: m.key.id,
                        participant: msgParticipant
                    }
                });
                await new Promise(r => setTimeout(r, 300));
            } catch (e) {
                // continue
            }
        }

        // Success message
        const successMsg = deleteGroupMessages
            ? `🗑️ Successfully deleted ${toDelete.length} message${toDelete.length > 1 ? 's' : ''} from the group.`
            : `🗑️ Successfully deleted ${toDelete.length} message${toDelete.length > 1 ? 's' : ''} from @${targetUser.split('@')[0]}.`;
        
        await sock.sendMessage(chatId, { 
            text: successMsg,
            mentions: deleteGroupMessages ? [] : [targetUser]
        }, { quoted: message });
    
    } catch (err) {
        console.error('Error in delete command:', err);
        await sock.sendMessage(chatId, { text: '❌ Failed to process deletion request.' }, { quoted: message });
    }
}

module.exports = deleteCommand;