const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    const helpMessage = `
╔════════════════════════╗
   🏛️  MASTERTECH-XD V1  
   Version: *${settings.version || '3.0.0'}*
   Creator: ${settings.botOwner || 'Masterpeace Elite'}
   YouTube: ${global.ytch}
╚════════════════════════╝

*Command Compendium*

╔════════════════════════╗
🌐 *General Commands*
╠════════════════════════╣
║ ┌─ .help | .menu
║ ├─ .ping
║ ├─ .alive
║ ├─ .tts <text>
║ ├─ .owner
║ ├─ .joke
║ ├─ .quote
║ ├─ .fact
║ ├─ .weather <city>
║ ├─ .news
║ ├─ .attp <text>
║ ├─ .lyrics <song_title>
║ ├─ .8ball <question>
║ ├─ .groupinfo
║ ├─ .staff | .admins
║ ├─ .vv
║ ├─ .trt <text> <lang>
║ ├─ .ss <link>
║ ├─ .jid
║ └─ .url
╚════════════════════════╝

╔════════════════════════╗
👑 *Administration Commands*
╠════════════════════════╣
║ ┌─ .ban @user
║ ├─ .promote @user
║ ├─ .demote @user
║ ├─ .mute <minutes>
║ ├─ .unmute
║ ├─ .delete | .del
║ ├─ .kick @user
║ ├─ .warnings @user
║ ├─ .warn @user
║ ├─ .antilink
║ ├─ .antibadword
║ ├─ .clear
║ ├─ .tag <message>
║ ├─ .tagall
║ ├─ .tagnotadmin
║ ├─ .hidetag <message>
║ ├─ .chatbot
║ ├─ .resetlink
║ ├─ .antitag <on/off>
║ ├─ .welcome <on/off>
║ ├─ .goodbye <on/off>
║ ├─ .setgdesc <description>
║ ├─ .setgname <new name>
║ └─ .setgpp (reply to image)
╚════════════════════════╝

╔════════════════════════╗
⚡ *Owner Commands*
╠════════════════════════╣
║ ┌─ .mode <public/private>
║ ├─ .clearsession
║ ├─ .antidelete
║ ├─ .cleartmp
║ ├─ .update
║ ├─ .settings
║ ├─ .setpp <reply to image>
║ ├─ .autoreact <on/off>
║ ├─ .autostatus <on/off>
║ ├─ .autostatus react <on/off>
║ ├─ .autotyping <on/off>
║ ├─ .autoread <on/off>
║ ├─ .anticall <on/off>
║ ├─ .pmblocker <on/off/status>
║ ├─ .pmblocker setmsg <text>
║ ├─ .setmention <reply to msg>
║ └─ .mention <on/off>
╚════════════════════════╝

╔════════════════════════╗
🎨 *Media Commands*
╠════════════════════════╣
║ ┌─ .blur <image>
║ ├─ .simage <reply to sticker>
║ ├─ .sticker <reply to image>
║ ├─ .removebg
║ ├─ .remini
║ ├─ .crop <reply to image>
║ ├─ .tgsticker <Link>
║ ├─ .meme
║ ├─ .take <packname>
║ ├─ .emojimix <emj1>+<emj2>
║ ├─ .igs <insta link>
║ └─ .igsc <insta link>
╚════════════════════════╝

╔════════════════════════╗
📥 *Download Commands*
╠════════════════════════╣
║ ┌─ .play <song_name>
║ ├─ .song <song_name>
║ ├─ .spotify <query>
║ ├─ .instagram <link>
║ ├─ .facebook <link>
║ ├─ .tiktok <link>
║ ├─ .video <song name>
║ └─ .ytmp4 <Link>
╚════════════════════════╝

╔════════════════════════╗
🤖 *AI Commands*
╠════════════════════════╣
║ ┌─ .gpt <question>
║ ├─ .gemini <question>
║ ├─ .imagine <prompt>
║ ├─ .flux <prompt>
║ └─ .sora <prompt>
╚════════════════════════╝

╔════════════════════════╗
🎮 *Entertainment Commands*
╠════════════════════════╣
║ ┌─ .tictactoe @user
║ ├─ .hangman
║ ├─ .guess <letter>
║ ├─ .trivia
║ ├─ .answer <answer>
║ ├─ .truth
║ └─ .dare
╚════════════════════════╝

╔════════════════════════╗
✨ *Social Commands*
╠════════════════════════╣
║ ┌─ .compliment @user
║ ├─ .insult @user
║ ├─ .flirt
║ ├─ .shayari
║ ├─ .goodnight
║ ├─ .roseday
║ ├─ .character @user
║ ├─ .wasted @user
║ ├─ .ship @user
║ ├─ .simp @user
║ └─ .stupid @user [text]
╚════════════════════════╝

╔════════════════════════╗
🔤 *Text Art Commands*
╠════════════════════════╣
║ ┌─ .metallic <text>
║ ├─ .ice <text>
║ ├─ .snow <text>
║ ├─ .impressive <text>
║ ├─ .matrix <text>
║ ├─ .light <text>
║ ├─ .neon <text>
║ ├─ .devil <text>
║ ├─ .purple <text>
║ ├─ .thunder <text>
║ ├─ .leaves <text>
║ ├─ .1917 <text>
║ ├─ .arena <text>
║ ├─ .hacker <text>
║ ├─ .sand <text>
║ ├─ .blackpink <text>
║ ├─ .glitch <text>
║ └─ .fire <text>
╚════════════════════════╝

*Join our channel for updates and announcements*`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363393631540851@newsletter',
                        newsletterName: 'MASTERTECH-XD V1',
                        serverMessageId: -1
                    }
                }
            },{ quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363393631540851@newsletter',
                        newsletterName: 'MASTERTECH-XD V1',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
