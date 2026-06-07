import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vaultPath = '/Users/spencer/Vaults/bnotes/.obsidian/plugins/obsidian-things-link';
const files = ['data.json', 'main.js', 'manifest.json', 'styles.css'];

// Ensure vault plugin directory exists
if (!fs.existsSync(vaultPath)) {
    fs.mkdirSync(vaultPath, { recursive: true });
    console.log(`Created directory: ${vaultPath}`);
}

files.forEach(file => {
    const src = path.join(__dirname, file);
    const dst = path.join(vaultPath, file);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dst);
        console.log(`✓ Copied ${file}`);
    } else {
        console.warn(`⚠ Warning: ${file} not found`);
    }
});

console.log('Done copying files to vault.');
