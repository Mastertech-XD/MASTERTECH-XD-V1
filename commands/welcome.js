const { handleWelcome } = require('../lib/welcome');
const { isWelcomeOn } = require('../lib/index');
const { channelInfo } = require('../lib/messageConfig');
const fetch = require('node-fetch');

async function welcomeCommand(sock, chatId, message, match) {
    // Check if it's a group
    if (!chatId.endsWith('@g.us')) {
        await sock.sendMessage(chatId, { 
            text: '🚫 *𝗚𝗥𝗢𝗨𝗣 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗢𝗡𝗟𝗬*\n\nThis command is designed for group administration.'
        }, { quoted: message });
        return;
    }

    // Extract match from message
    const text = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || '';
    const matchText = text.split(' ').slice(1).join(' ');

    await handleWelcome(sock, chatId, message, matchText);
}

async function handleJoinEvent(sock, id, participants) {
    // Check if welcome is enabled for this group
    const isWelcomeEnabled = await isWelcomeOn(id);
    if (!isWelcomeEnabled) return;

    // Get group metadata
    const groupMetadata = await sock.groupMetadata(id);
    const groupName = groupMetadata.subject;
    const groupDesc = groupMetadata.desc || 'No description available';
    const memberCount = groupMetadata.participants.length;

    // Send welcome message for each new participant
    for (const participant of participants) {
        try {
            const user = participant.split('@')[0];
            
            // Get user's display name
            let displayName = user; // Default to phone number
            try {
                const contact = await sock.getBusinessProfile(participant);
                if (contact && contact.name) {
                    displayName = contact.name;
                } else {
                    // Try to get from group participants
                    const groupParticipants = groupMetadata.participants;
                    const userParticipant = groupParticipants.find(p => p.id === participant);
                    if (userParticipant && userParticipant.name) {
                        displayName = userParticipant.name;
                    }
                }
            } catch (nameError) {
                console.log('Could not fetch display name, using phone number');
            }
            
            // Get user profile picture
            let profilePicUrl = `https://img.pyrocdn.com/dbKUgahg.png`; // Default avatar
            try {
                const profilePic = await sock.profilePictureUrl(participant, 'image');
                if (profilePic) {
                    profilePicUrl = profilePic;
                }
            } catch (profileError) {
                console.log('Could not fetch profile picture, using default');
            }
            
            // Construct API URL for welcome image
            const apiUrl = `https://api.some-random-api.com/welcome/img/2/gaming3?type=join&textcolor=green&username=${encodeURIComponent(displayName)}&guildName=${encodeURIComponent(groupName)}&memberCount=${memberCount}&avatar=${encodeURIComponent(profilePicUrl)}`;
            
            // Fetch the welcome image
            const response = await fetch(apiUrl);
            if (response.ok) {
                const imageBuffer = await response.buffer();
                
                // Get current time
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });

                // Send welcome image with super cool caption
                await sock.sendMessage(id, {
                    image: imageBuffer,
                    caption: `╔═══✦⋅■ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ⋅■✦═══╗\n\n` +
                             `🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘: @${displayName}\n` +
                             `👥 𝗠𝗘𝗠𝗕𝗘𝗥 #${memberCount}\n` +
                             `📊 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${memberCount}\n` +
                             `🕒 ${timeString}\n\n` +
                             `✨ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼: ${groupName}\n\n` +
                             `📝 𝗚𝗿𝗼𝘂𝗽 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n${groupDesc}\n\n` +
                             `╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`,
                    mentions: [participant],
                    ...channelInfo
                });
            } else {
                // Get current time for fallback
                const now = new Date();
                const timeString = now.toLocaleString('en-US', {
                    month: '2-digit',
                    day: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true
                });

                // Fallback to text message if API fails
                const welcomeMessage = `╔═══✦⋅■ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ⋅■✦═══╗\n\n` +
                                     `🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘: @${displayName}\n` +
                                     `👥 𝗠𝗘𝗠𝗕𝗘𝗥 #${memberCount}\n` +
                                     `📊 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${memberCount}\n` +
                                     `🕒 ${timeString}\n\n` +
                                     `✨ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼: ${groupName}\n\n` +
                                     `📝 𝗚𝗿𝗼𝘂𝗽 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n${groupDesc}\n\n` +
                                     `╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`;
                await sock.sendMessage(id, {
                    text: welcomeMessage,
                    mentions: [participant],
                    ...channelInfo
                });
            }
        } catch (error) {
            console.error('Error sending welcome message:', error);
            // Fallback to text message
            const user = participant.split('@')[0];
            
            // Get current time for error fallback
            const now = new Date();
            const timeString = now.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });

            const welcomeMessage = `╔═══✦⋅■ 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 ⋅■✦═══╗\n\n` +
                                 `🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘: @${user}\n` +
                                 `👥 𝗠𝗘𝗠𝗕𝗘𝗥 #${memberCount}\n` +
                                 `📊 𝗧𝗼𝘁𝗮𝗹 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${memberCount}\n` +
                                 `🕒 ${timeString}\n\n` +
                                 `✨ 𝗪𝗲𝗹𝗰𝗼𝗺𝗲 𝘁𝗼: ${groupName}\n\n` +
                                 `📝 𝗚𝗿𝗼𝘂𝗽 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻:\n${groupDesc}\n\n` +
                                 `╚═══✦⋅■ 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭 ⋅■✦═══╝`;
            await sock.sendMessage(id, {
                text: welcomeMessage,
                mentions: [participant],
                ...channelInfo
            });
        }
    }
}

module.exports = { welcomeCommand, handleJoinEvent };