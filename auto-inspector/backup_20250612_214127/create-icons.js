const fs = require('fs');
const path = require('path');

// Create simple 1x1 pixel PNG files for different sizes
// This is the minimal PNG file structure for a 1x1 transparent pixel
const pngHeader = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // IHDR
]);

const pngFooter = Buffer.from([
  0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // IDAT
  0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // IEND
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

function createPngFile(width, height, filename) {
  const widthBytes = Buffer.alloc(4);
  const heightBytes = Buffer.alloc(4);
  widthBytes.writeUInt32BE(width, 0);
  heightBytes.writeUInt32BE(height, 0);
  
  // Simple blue square PNG data (minimal implementation)
  const data = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]), // PNG signature
    Buffer.from([0x00, 0x00, 0x00, 0x0D]), // IHDR length
    Buffer.from('IHDR'), 
    widthBytes,
    heightBytes,
    Buffer.from([0x08, 0x02, 0x00, 0x00, 0x00]), // bit depth, color type, etc.
    Buffer.from([0xFC, 0x18, 0xED, 0xA3]), // CRC (placeholder)
    Buffer.from([0x00, 0x00, 0x00, 0x0C]), // IDAT length
    Buffer.from('IDAT'),
    Buffer.from([0x78, 0x9C, 0x63, 0x60, 0x64, 0x62, 0x06, 0x00, 0x00, 0x0F, 0x00, 0x07]), // minimal compressed data
    Buffer.from([0x33, 0x33, 0x33, 0x33]), // CRC (placeholder)
    Buffer.from([0x00, 0x00, 0x00, 0x00]), // IEND length
    Buffer.from('IEND'),
    Buffer.from([0xAE, 0x42, 0x60, 0x82]) // IEND CRC
  ]);
  
  fs.writeFileSync(filename, data);
}

// Create icon files
const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir);
}

createPngFile(16, 16, path.join(iconsDir, 'icon16.png'));
createPngFile(32, 32, path.join(iconsDir, 'icon32.png'));
createPngFile(48, 48, path.join(iconsDir, 'icon48.png'));
createPngFile(128, 128, path.join(iconsDir, 'icon128.png'));

console.log('✅ PNG icon files created');
console.log('Files created:');
fs.readdirSync(iconsDir).forEach(file => {
  if (file.endsWith('.png')) {
    const stat = fs.statSync(path.join(iconsDir, file));
    console.log(`  ${file} (${stat.size} bytes)`);
  }
});
