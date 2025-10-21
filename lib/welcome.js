const { addWelcome, delWelcome, isWelcomeOn, addGoodbye, delGoodBye, isGoodByeOn } = require('../lib/index');
const { delay } = require('@whiskeysockets/baileys');

async function handleWelcome(sock, chatId, message, match) {
    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╔═══✦⋅■ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗦𝗘𝗧𝗨𝗣 ⋅■✦═══╗

║  📥 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗖𝗢𝗡𝗙𝗜𝗚
║
║  ✅ .welcome on
║     └─ Enable welcome messages
║
║  🛠️ .welcome set <message>
║     └─ Set custom welcome message
║
║  🚫 .welcome off
║     └─ Disable welcome messages
║
║  📋 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗩𝗔𝗥𝗜𝗔𝗕𝗟𝗘𝗦:
║     └─ {user} - Mentions new member
║     └─ {group} - Shows group name
║     └─ {description} - Group description
║     └─ {memberCount} - Total members
║
╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`,
            quoted: message
        });
    }

    const [command, ...args] = match.split(' ');
    const lowerCommand = command.toLowerCase();
    const customMessage = args.join(' ');

    if (lowerCommand === 'on') {
        if (await isWelcomeOn(chatId)) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗔𝗖𝗧𝗜𝗩𝗘*\n\nWelcome messages are already enabled for this group.', 
                quoted: message 
            });
        }
        await addWelcome(chatId, true, 'Welcome {user} to {group}! 🎉');
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗘𝗡𝗔𝗕𝗟𝗘𝗗*\n\nWelcome messages activated with default message.\nUse *.welcome set <message>* to customize.', 
            quoted: message 
        });
    }

    if (lowerCommand === 'off') {
        if (!(await isWelcomeOn(chatId))) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗜𝗡𝗔𝗖𝗧𝗜𝗩𝗘*\n\nWelcome messages are already disabled.', 
                quoted: message 
            });
        }
        await delWelcome(chatId);
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗*\n\nWelcome messages disabled for this group.', 
            quoted: message 
        });
    }

    if (lowerCommand === 'set') {
        if (!customMessage) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗*\n\nPlease provide a custom welcome message.\nExample: *.welcome set Welcome to our community!*', 
                quoted: message 
            });
        }
        await addWelcome(chatId, true, customMessage);
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗖𝗨𝗦𝗧𝗢𝗠 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗦𝗘𝗧*\n\nCustom welcome message configured successfully.', 
            quoted: message 
        });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `🚫 *𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗*\n\nUsage:\n• .welcome on - Enable\n• .welcome set <message> - Customize\n• .welcome off - Disable`,
        quoted: message
    });
}

async function handleGoodbye(sock, chatId, message, match) {
    const lower = match?.toLowerCase();

    if (!match) {
        return sock.sendMessage(chatId, {
            text: `╔═══✦⋅■ 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗦𝗘𝗧𝗨𝗣 ⋅■✦═══╗

║  📤 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗖𝗢𝗡𝗙𝗜𝗚
║
║  ✅ .goodbye on
║     └─ Enable goodbye messages
║
║  🛠️ .goodbye set <message>
║     └─ Set custom goodbye message
║
║  🚫 .goodbye off
║     └─ Disable goodbye messages
║
║  📋 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗩𝗔𝗥𝗜𝗔𝗕𝗟𝗘𝗦:
║     └─ {user} - Mentions leaving member
║     └─ {group} - Shows group name
║     └─ {memberCount} - Total members
║
╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`,
            quoted: message
        });
    }

    if (lower === 'on') {
        if (await isGoodByeOn(chatId)) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗔𝗖𝗧𝗜𝗩𝗘*\n\nGoodbye messages are already enabled for this group.', 
                quoted: message 
            });
        }
        await addGoodbye(chatId, true, 'Goodbye {user} 👋');
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗘𝗡𝗔𝗕𝗟𝗘𝗗*\n\nGoodbye messages activated with default message.\nUse *.goodbye set <message>* to customize.', 
            quoted: message 
        });
    }

    if (lower === 'off') {
        if (!(await isGoodByeOn(chatId))) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗜𝗡𝗔𝗖𝗧𝗜𝗩𝗘*\n\nGoodbye messages are already disabled.', 
                quoted: message 
            });
        }
        await delGoodBye(chatId);
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗗𝗜𝗦𝗔𝗕𝗟𝗘𝗗*\n\nGoodbye messages disabled for this group.', 
            quoted: message 
        });
    }

    if (lower.startsWith('set ')) {
        const customMessage = match.substring(4);
        if (!customMessage) {
            return sock.sendMessage(chatId, { 
                text: '⚠️ *𝗠𝗘𝗦𝗦𝗔𝗚𝗘 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗*\n\nPlease provide a custom goodbye message.\nExample: *.goodbye set Farewell friend!*', 
                quoted: message 
            });
        }
        await addGoodbye(chatId, true, customMessage);
        return sock.sendMessage(chatId, { 
            text: '✅ *𝗖𝗨𝗦𝗧𝗢𝗠 𝗚𝗢𝗢𝗗𝗕𝗬𝗘 𝗦𝗘𝗧*\n\nCustom goodbye message configured successfully.', 
            quoted: message 
        });
    }

    // If no valid command is provided
    return sock.sendMessage(chatId, {
        text: `🚫 *𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗*\n\nUsage:\n• .goodbye on - Enable\n• .goodbye set <message> - Customize\n• .goodbye off - Disable`,
        quoted: message
    });
}

module.exports = { handleWelcome, handleGoodbye };