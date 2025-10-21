const axios = require('axios');
const { channelInfo } = require('../lib/messageConfig');

async function characterCommand(sock, chatId, message) {
    let userToAnalyze;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToAnalyze = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToAnalyze) {
        await sock.sendMessage(chatId, { 
            text: '🔍 Please mention someone or reply to their message to analyze their character.', 
            ...channelInfo 
        }, { quoted: message });
        return;
    }

    try {
        // Get user's profile picture
        let profilePic;
        try {
            profilePic = await sock.profilePictureUrl(userToAnalyze, 'image');
        } catch {
            profilePic = 'https://i.imgur.com/2wzGhpF.jpeg'; // Default image if no profile pic
        }

        const traits = [
    "Intelligent", "Creative", "Determined", "Ambitious", "Caring",
    "Charismatic", "Confident", "Empathetic", "Energetic", "Friendly",
    "Generous", "Honest", "Humorous", "Imaginative", "Independent",
    "Intuitive", "Kind", "Logical", "Loyal", "Optimistic",
    "Passionate", "Patient", "Persistent", "Reliable", "Resourceful",
    "Sincere", "Thoughtful", "Understanding", "Versatile", "Wise",
    "Adaptable", "Adventurous", "Analytical", "Articulate", "Assertive",
    "Attentive", "Brave", "Calm", "Capable", "Charming",
    "Compassionate", "Conscientious", "Considerate", "Courageous", "Curious",
    "Dedicated", "Dependable", "Diplomatic", "Disciplined", "Driven",
    "Dynamic", "Efficient", "Eloquent", "Enthusiastic", "Flexible",
    "Focused", "Forgiving", "Genuine", "Graceful", "Hardworking",
    "Helpful", "Innovative", "Insightful", "Inspiring", "Inventive",
    "Joyful", "Judicious", "Knowledgeable", "Meticulous", "Methodical",
    "Motivated", "Nurturing", "Observant", "Open-minded", "Organized",
    "Perceptive", "Perfectionist", "Pioneering", "Practical", "Proactive",
    "Problem-solver", "Punctual", "Quick-witted", "Rational", "Resilient",
    "Respectful", "Responsible", "Self-aware", "Self-disciplined", "Sensible",
    "Skillful", "Spontaneous", "Strategic", "Supportive", "Tactful",
    "Tenacious", "Thorough", "Tolerant", "Trustworthy", "Visionary",
    "Witty", "Zealous", "Altruistic", "Authentic", "Balanced",
    "Benevolent", "Brilliant", "Collaborative", "Committed", "Composed",
    "Courteous", "Decisive", "Devoted", "Diligent", "Discerning",
    "Earnest", "Empowering", "Enduring", "Ethical", "Excellence-driven",
    "Fair", "Fearless", "Forward-thinking", "Gracious", "Harmonious",
    "Heartfelt", "Honorable", "Humble", "Idealistic", "Influential",
    "Ingenious", "Integrity-driven", "Leadership-oriented", "Mindful", "Moral",
    "Noble", "Objective", "Original", "Passionate", "Peaceful",
    "Philosophical", "Pragmatic", "Principled", "Productive", "Profound",
    "Purposeful", "Reflective", "Resolute", "Sagacious", "Scholarly",
    "Serene", "Sophisticated", "Spirited", "Steadfast", "Stoic",
    "Strategic", "Substantial", "Sympathetic", "Tireless", "Tranquil",
    "Unbiased", "Unconventional", "Unwavering", "Vibrant", "Virtuous",
    "Well-rounded", "Wholesome", "Winsome", "Worldly", "Youthful"
];

        // Get 3-5 random traits
        const numTraits = Math.floor(Math.random() * 3) + 3; // Random number between 3 and 5
        const selectedTraits = [];
        for (let i = 0; i < numTraits; i++) {
            const randomTrait = traits[Math.floor(Math.random() * traits.length)];
            if (!selectedTraits.includes(randomTrait)) {
                selectedTraits.push(randomTrait);
            }
        }

        // Calculate random percentages for each trait
        const traitPercentages = selectedTraits.map(trait => {
            const percentage = Math.floor(Math.random() * 41) + 60; // Random number between 60-100
            return `▸ ${trait}: ${percentage}%`;
        });

        // Create character analysis message
        const analysis = `📊 *Character Analysis Report*\n\n` +
            `👤 *Subject:* @${userToAnalyze.split('@')[0]}\n\n` +
            `✨ *Primary Traits Analysis:*\n${traitPercentages.join('\n')}\n\n` +
            `📈 *Overall Compatibility:* ${Math.floor(Math.random() * 21) + 80}%\n\n` +
            `_Note: This analysis is for entertainment purposes only._`;

        // Send the analysis with the user's profile picture
        await sock.sendMessage(chatId, {
            image: { url: profilePic },
            caption: analysis,
            mentions: [userToAnalyze],
            ...channelInfo
        }, { quoted: message });

    } catch (error) {
        console.error('Error in character command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Unable to generate character analysis. Please try again.',
            ...channelInfo 
        }, { quoted: message });
    }
}

module.exports = characterCommand;