const { igdl } = require("ruhend-scraper");

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

// Function to extract unique media URLs with simple deduplication
function extractUniqueMedia(mediaData) {
    const uniqueMedia = [];
    const seenUrls = new Set();
    
    for (const media of mediaData) {
        if (!media.url) continue;
        
        // Only check for exact URL duplicates
        if (!seenUrls.has(media.url)) {
            seenUrls.add(media.url);
            uniqueMedia.push(media);
        }
    }
    
    return uniqueMedia;
}

// Function to validate media URL
function isValidMediaUrl(url) {
    if (!url || typeof url !== 'string') return false;
    
    // Accept any URL that looks like media
    return url.includes('cdninstagram.com') || 
           url.includes('instagram') || 
           url.includes('http');
}

async function instagramCommand(sock, chatId, message) {
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "📥 *Content Request*\n\nPlease provide an Instagram link to retrieve the media content."
            });
        }

        // Check for various Instagram URL formats
        const instagramPatterns = [
            /https?:\/\/(?:www\.)?instagram\.com\//,
            /https?:\/\/(?:www\.)?instagr\.am\//,
            /https?:\/\/(?:www\.)?instagram\.com\/p\//,
            /https?:\/\/(?:www\.)?instagram\.com\/reel\//,
            /https?:\/\/(?:www\.)?instagram\.com\/tv\//
        ];

        const isValidUrl = instagramPatterns.some(pattern => pattern.test(text));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: "🔗 *Invalid Link Format*\n\nThat does not appear to be a valid Instagram URL.\nPlease provide a valid Instagram post, reel, or video link."
            });
        }

        await sock.sendMessage(chatId, {
            react: { text: '🔄', key: message.key }
        });

        const downloadData = await igdl(text);
        
        if (!downloadData || !downloadData.data || downloadData.data.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "📭 *Content Unavailable*\n\nNo media found at the provided link.\nThe content may be private, removed, or the link may be invalid."
            });
        }

        const mediaData = downloadData.data;
        
        // Simple deduplication - just remove exact URL duplicates
        const uniqueMedia = extractUniqueMedia(mediaData);
        
        // Limit to maximum 20 unique media items
        const mediaToDownload = uniqueMedia.slice(0, 20);
        
        if (mediaToDownload.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: "📭 *No Valid Media*\n\nNo downloadable content found.\nThis may be a private post or the content is not accessible."
            });
        }

        // Download all media silently without status messages
        for (let i = 0; i < mediaToDownload.length; i++) {
            try {
                const media = mediaToDownload[i];
                const mediaUrl = media.url;

                // Check if URL ends with common video extensions
                const isVideo = /\.(mp4|mov|avi|mkv|webm)$/i.test(mediaUrl) || 
                              media.type === 'video' || 
                              text.includes('/reel/') || 
                              text.includes('/tv/');

                if (isVideo) {
                    await sock.sendMessage(chatId, {
                        video: { url: mediaUrl },
                        mimetype: "video/mp4",
                        caption: "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭"
                    }, { quoted: message });
                } else {
                    await sock.sendMessage(chatId, {
                        image: { url: mediaUrl },
                        caption: "𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗕𝗬 𝗠𝗔𝗦𝗧𝗘𝗥𝗧𝗘𝗖𝗛-𝗫𝗗 𝗩𝟭"
                    }, { quoted: message });
                }
                
                // Add small delay between downloads to prevent rate limiting
                if (i < mediaToDownload.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
                
            } catch (mediaError) {
                console.error(`Error downloading media ${i + 1}:`, mediaError);
                // Continue with next media if one fails
            }
        }

    } catch (error) {
        console.error('Error in Instagram command:', error);
        await sock.sendMessage(chatId, { 
            text: "❌ *Processing Error*\n\nAn unexpected error occurred while retrieving the content.\nPlease verify the link and try again."
        });
    }
}

module.exports = instagramCommand;