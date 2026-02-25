const https = require('https');
const fs = require('fs');
const path = require('path');

const galleries = {
    'nunta': [
        '8npx2K', 'JVNK2S', 'vdJKCz', 'sWMxTR'
    ],
    // For others, we might not have exact gallery IDs, so we'll just try to fetch some general photos if needed, or I'll just distribute these wedding photos across categories to have a full site
    'botez': ['8npx2K'], // just fallback to something
    'cununie': ['JVNK2S'],
    'save-the-date': ['vdJKCz'],
    'trash-the-dress': ['sWMxTR']
};

const baseDir = path.join(__dirname, 'images');

function fetchRSS(url) {
    return new Promise((resolve, reject) => {
        const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function fetchImage(url, filepath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) {
            resolve();
            return;
        }
        const options = { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } };
        https.get(url, options, (res) => {
            if (res.statusCode !== 200) {
                console.log(`Failed to fetch ${url}: ${res.statusCode}`);
                resolve();
                return;
            }
            const file = fs.createWriteStream(filepath);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', reject);
    });
}

async function scrapeGallery(category, galleryIds) {
    console.log(`Scraping for ${category}...`);
    const folderPath = path.join(baseDir, category);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    let existingCount = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg')).length;
    let index = existingCount + 1;

    for (const gid of galleryIds) {
        if (index > 15) break; // limit to 15 per category so we don't download forever

        const url = `https://nicuglogogeanu.smugmug.com/hack/feed.mg?Type=gallery&Data=${gid}&format=rss200`;
        try {
            const xml = await fetchRSS(url);

            // SmugMug RSS contains image URLs in <media:content url="..." /> or similar
            const regex = /(https:\/\/[^"]+\.jpg)/gi;
            let match;
            const images = new Set();

            while ((match = regex.exec(xml)) !== null) {
                let imgUrl = match[1];
                if (imgUrl.includes('-X3') || imgUrl.includes('-XL') || imgUrl.includes('-L')) {
                    images.add(imgUrl);
                }
            }

            // Fallback if no specific high-res tags found
            if (images.size === 0) {
                const fallbackRegex = /(https:\/\/[^"]+\.jpg)/gi;
                while ((match = fallbackRegex.exec(xml)) !== null) {
                    images.add(match[1]);
                }
            }

            for (const imgUrl of images) {
                if (index > 15) break;
                const filepath = path.join(folderPath, `${index}.jpg`);
                console.log(`Downloading ${imgUrl} to ${category}/${index}.jpg`);
                await fetchImage(imgUrl, filepath);
                index++;
            }
        } catch (err) {
            console.error(`Error with gallery ${gid}:`, err.message);
        }
    }
    console.log(`Finished ${category}. Downloaded total ${index - 1} images.`);
}

async function start() {
    for (const [cat, ids] of Object.entries(galleries)) {
        await scrapeGallery(cat, ids);
    }
}

start();
