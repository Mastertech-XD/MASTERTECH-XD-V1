const { bots } = require('../lib/antilink');
const { setAntilink, getAntilink, removeAntilink } = require('../lib/index');
const isAdmin = require('../lib/isAdmin');

async function handleAntilinkCommand(sock, chatId, userMessage, senderId, isSenderAdmin, message) {
    try {
        if (!isSenderAdmin) {
            await sock.sendMessage(chatId, { text: '🎮 *Only Guild Leaders can use this command!* 🛡️' }, { quoted: message });
            return;
        }

        const prefix = '.';
        const args = userMessage.slice(9).toLowerCase().trim().split(' ');
        const action = args[0];

        if (!action) {
            const usage = `🎮〚 LINK GUARDIAN CONTROL PANEL 〛🎮\n\n⚡ *Available Commands:*\n╰┈➤ ${prefix}antilink on - Activate Shield\n╰┈➤ ${prefix}antilink set delete | kick | warn\n╰┈➤ ${prefix}antilink off - Deactivate System\n╰┈➤ ${prefix}antilink get - Check Status`;
            await sock.sendMessage(chatId, { text: usage }, { quoted: message });
            return;
        }

        switch (action) {
            case 'on':
                const existingConfig = await getAntilink(chatId, 'on');
                if (existingConfig?.enabled) {
                    await sock.sendMessage(chatId, { text: '🛡️ *Link Guardian is already ACTIVATED!* ⚔️' }, { quoted: message });
                    return;
                }
                const result = await setAntilink(chatId, 'on', 'delete');
                await sock.sendMessage(chatId, { 
                    text: result ? '🎮 *LINK GUARDIAN ACTIVATED!* 🟢\n⚔️ *All hostile links will be terminated!*' : '🎮⚠️ *Mission Failed: Could not activate Link Guardian*' 
                },{ quoted: message });
                break;

            case 'off':
                await removeAntilink(chatId, 'on');
                await sock.sendMessage(chatId, { text: '🎮 *LINK GUARDIAN DEACTIVATED!* 🔴\n🛡️ *Link protection shield is now offline*' }, { quoted: message });
                break;

            case 'set':
                if (args.length < 2) {
                    await sock.sendMessage(chatId, { 
                        text: `🎮⚠️ *Choose your defense strategy:*\n╰┈➤ ${prefix}antilink set delete | kick | warn` 
                    }, { quoted: message });
                    return;
                }
                const setAction = args[1];
                if (!['delete', 'kick', 'warn'].includes(setAction)) {
                    await sock.sendMessage(chatId, { 
                        text: '🎮❌ *Invalid defense strategy!*\n╰┈➤ Choose: delete 🗑️ | kick 🦵 | warn ⚠️' 
                    }, { quoted: message });
                    return;
                }
                const setResult = await setAntilink(chatId, 'on', setAction);
                const actionEmoji = {
                    'delete': '🗑️',
                    'kick': '🦵', 
                    'warn': '⚠️'
                };
                await sock.sendMessage(chatId, { 
                    text: setResult ? `🎮 *DEFENSE STRATEGY UPDATED!*\n⚔️ Action: ${setAction} ${actionEmoji[setAction]}` : '🎮⚠️ *Failed to update defense strategy*' 
                }, { quoted: message });
                break;

            case 'get':
                const status = await getAntilink(chatId, 'on');
                const actionConfig = await getAntilink(chatId, 'on');
                const statusEmoji = status ? '🟢' : '🔴';
                const actionText = actionConfig ? actionConfig.action : 'Not set';
                await sock.sendMessage(chatId, { 
                    text: `🎮〚 LINK GUARDIAN STATUS 〛🎮\n\n${statusEmoji} *Status:* ${status ? 'ACTIVE' : 'INACTIVE'}\n⚔️ *Defense Strategy:* ${actionText}\n🛡️ *Protection Level:* MAXIMUM` 
                }, { quoted: message });
                break;

            default:
                await sock.sendMessage(chatId, { text: `🎮 *Use ${prefix}antilink to access the control panel*` });
        }
    } catch (error) {
        console.error('Error in antilink command:', error);
        await sock.sendMessage(chatId, { text: '🎮⚠️ *System Error: Link Guardian malfunction!*' });
    }
}

async function handleLinkDetection(sock, chatId, message, userMessage, senderId) {
    const antilinkSetting = getAntilinkSetting(chatId);
    if (antilinkSetting === 'off') return;

    console.log(`Antilink Setting for ${chatId}: ${antilinkSetting}`);
    console.log(`Checking message for links: ${userMessage}`);
    
    // Log the full message object to diagnose message structure
    console.log("Full message object: ", JSON.stringify(message, null, 2));

    let shouldDelete = false;

    const linkPatterns = {
        whatsappGroup: /chat\.whatsapp\.com\/[A-Za-z0-9]{20,}/i,
        whatsappChannel: /wa\.me\/channel\/[A-Za-z0-9]{20,}/i,
        telegram: /t\.me\/[A-Za-z0-9_]+/i,
        // Matches:
        // - Full URLs with protocol (http/https)
        // - URLs starting with www.
        // - Bare domains anywhere in the string, even when attached to text
        //   e.g., "helloinstagram.comworld" or "testhttps://x.com"
        allLinks: /https?:\/\/\S+|www\.\S+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?/i,
    };

    // Detect WhatsApp Group links
    if (antilinkSetting === 'whatsappGroup') {
        console.log('WhatsApp group link protection is enabled.');
        if (linkPatterns.whatsappGroup.test(userMessage)) {
            console.log('Detected a WhatsApp group link!');
            shouldDelete = true;
        }
    } else if (antilinkSetting === 'whatsappChannel' && linkPatterns.whatsappChannel.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'telegram' && linkPatterns.telegram.test(userMessage)) {
        shouldDelete = true;
    } else if (antilinkSetting === 'allLinks' && linkPatterns.allLinks.test(userMessage)) {
        shouldDelete = true;
    }

    if (shouldDelete) {
        const quotedMessageId = message.key.id; // Get the message ID to delete
        const quotedParticipant = message.key.participant || senderId; // Get the participant ID

        console.log(`Attempting to delete message with id: ${quotedMessageId} from participant: ${quotedParticipant}`);

        try {
            await sock.sendMessage(chatId, {
                delete: { remoteJid: chatId, fromMe: false, id: quotedMessageId, participant: quotedParticipant },
            });
            console.log(`Message with ID ${quotedMessageId} deleted successfully.`);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }

        const mentionedJidList = [senderId];
        await sock.sendMessage(chatId, { 
            text: `🎮〚 SECURITY BREACH DETECTED 〛🎮\n\n⚠️ *ALERT!* @${senderId.split('@')[0]}\n🛡️ *Hostile links are forbidden in this realm!*\n⚔️ *Your message has been terminated!*`, 
            mentions: mentionedJidList 
        });
    } else {
        console.log('No link detected or protection not enabled for this type of link.');
    }
}

module.exports = {
    handleAntilinkCommand,
    handleLinkDetection,
};