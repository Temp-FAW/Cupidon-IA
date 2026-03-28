const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

console.log("Lecture de index.html...");

// 1. Extraction et Remplacement du CSS
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
    fs.writeFileSync(path.join(__dirname, 'style.css'), styleMatch[1].trim());
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="style.css">');
    console.log("✓ style.css généré !");
} else {
    console.log("❌ Aucun <style> trouvé.");
}

// 2. Extraction et Remplacement du JS
// On évite le script CDN (html2canvas) et on cible le script tag non importé (<script> avec contenu direct)
const scriptRegex = /<script>([\s\S]*?)<\/script>/;
const scriptMatch = html.match(scriptRegex);
if (scriptMatch) {
    fs.writeFileSync(path.join(__dirname, 'script.js'), scriptMatch[1].trim());
    html = html.replace(scriptMatch[0], '<script src="script.js"></script>');
    console.log("✓ script.js généré !");
} else {
    console.log("❌ Aucun bloc <script> principal trouvé.");
}

// 3. Sauvegarde de index.html allégé
fs.writeFileSync(filePath, html);
console.log("✓ index.html mis à jour et allégé (Refactoring terminé) !");
