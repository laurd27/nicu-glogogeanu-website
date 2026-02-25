const https = require('https');
const fs = require('fs');
const path = require('path');

const categories = {
    'nunta': 'https://nicuglogogeanu.ro/nunta/',
    'botez': 'https://nicuglogogeanu.ro/botez/',
    'cununie': 'https://nicuglogogeanu.ro/cununie-civila/',
    'save-the-date': 'https://nicuglogogeanu.ro/save-the-date/',
    'trash-the-dress': 'https://nicuglogogeanu.ro/trash-the-dress/'
};

const baseDir = path.join(__dirname, 'images');

function fetchHTML(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

function fetchImage(url, filepath) {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filepath)) {
            resolve(); // already exists
            return;
        }
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                resolve(); // skip errors
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

async function scrapeCategory(category, url) {
    console.log(`Scraping ${category} from ${url}...`);
    try {
        const html = await fetchHTML(url);

        // Find all jpg/png/webp image URLs in the HTML
        // Assuming images are in href or src attributes
        const regex = /(?:href|src)=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp)(?:\?[^"']*)?)["']/gi;
        let match;
        const imageUrls = new Set();

        while ((match = regex.exec(html)) !== null) {
            let imgUrl = match[1];
            // Filter out thumbnails, usually have -150x150.jpg or similar
            if (!imgUrl.match(/-\d+x\d+\.(jpg|jpeg|png|webp)$/i) && !imgUrl.includes('logo')) {
                imageUrls.add(imgUrl);
            }
        }

        // Convert back to array
        const urls = Array.from(imageUrls);
        console.log(`Found ${urls.length} images for ${category}`);

        const folderPath = path.join(baseDir, category);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        // Existing files to determine starting index
        const existingFiles = fs.readdirSync(folderPath);
        let maxIndex = 0;
        existingFiles.forEach(f => {
            const num = parseInt(f.split('.')[0]);
            if (!isNaN(num) && num > maxIndex) {
                maxIndex = num;
            }
        });

        let index = maxIndex + 1;

        for (const imgUrl of urls) {
            const ext = path.extname(new URL(imgUrl).pathname);
            const filepath = path.join(folderPath, `${index}${ext}`);
            console.log(`Downloading ${imgUrl} to ${filepath}`);
            await fetchImage(imgUrl, filepath);
            index++;
        }

        console.log(`Done with ${category}.`);
    } catch (err) {
        console.error(`Error scraping ${category}:`, err);
    }
}

async function start() {
    for (const [cat, url] of Object.entries(categories)) {
        await scrapeCategory(cat, url);
    }
    console.log('All done!');
}

start();
