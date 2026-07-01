const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

// Ensure assets/notification-icon.png exists (monochrome white silhouette for Android status bar)
function ensureMonochromeNotificationIcon() {
  try {
    const assetsDir = path.join(__dirname, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }
    const iconPath = path.join(assetsDir, 'notification-icon.png');
    if (fs.existsSync(iconPath)) {
      return; // Already generated
    }

    // Generate CRC32 table
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        if (c & 1) c = 0xedb88320 ^ (c >>> 1);
        else c = c >>> 1;
      }
      crcTable[n] = c;
    }

    function crc32(buf) {
      let crc = 0xffffffff;
      for (let i = 0; i < buf.length; i++) {
        crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
      }
      return (crc ^ 0xffffffff) >>> 0;
    }

    function createChunk(type, data) {
      const lenBuf = Buffer.alloc(4);
      lenBuf.writeUInt32BE(data.length, 0);
      const typeAndData = Buffer.concat([Buffer.from(type), data]);
      const crcBuf = Buffer.alloc(4);
      crcBuf.writeUInt32BE(crc32(typeAndData), 0);
      return Buffer.concat([lenBuf, typeAndData, crcBuf]);
    }

    const width = 96;
    const height = 96;

    const raw = Buffer.alloc(height * (1 + width * 4));
    let offset = 0;

    for (let y = 0; y < height; y++) {
      raw[offset++] = 0; // Filter type 0
      for (let x = 0; x < width; x++) {
        const cx = 48, cy = 48;
        const dx = x - cx, dy = y - cy;
        
        // Graduation cap silhouette for monochrome status bar icon
        const inDiamond = Math.abs(dx) / 34.0 + Math.abs(y - 38) / 15.0 <= 1.0;
        const inBase = Math.abs(dx) <= 18 && y >= 38 && y <= 58;
        const inTassel = (x >= 74 && x <= 78 && y >= 38 && y <= 64);
        
        if (inDiamond || inBase || inTassel) {
          raw[offset++] = 255;
          raw[offset++] = 255;
          raw[offset++] = 255;
          raw[offset++] = 255; // White opaque
        } else {
          raw[offset++] = 255;
          raw[offset++] = 255;
          raw[offset++] = 255;
          raw[offset++] = 0;   // Transparent
        }
      }
    }

    const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8;
    ihdrData[9] = 6;
    ihdrData[10] = 0;
    ihdrData[11] = 0;
    ihdrData[12] = 0;

    const idatData = zlib.deflateSync(raw);
    const png = Buffer.concat([
      header,
      createChunk('IHDR', ihdrData),
      createChunk('IDAT', idatData),
      createChunk('IEND', Buffer.alloc(0))
    ]);

    fs.writeFileSync(iconPath, png);
    console.log('🔔 [app.config.js] Automatically created monochrome notification-icon.png');
  } catch (err) {
    console.error('⚠️ [app.config.js] Failed to generate notification icon:', err.message);
  }
}

// Run before returning config
ensureMonochromeNotificationIcon();

module.exports = ({ config }) => {
  return {
    ...config,
  };
};
