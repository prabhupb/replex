const fs = require('fs');

// Create simple SVG icons that can be converted to PNG
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1da1f2;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1991db;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
    <path d="M${size * 0.2} ${size * 0.15} L${size * 0.8} ${size * 0.15} Q${size * 0.85} ${size * 0.15} ${size * 0.85} ${size * 0.2} L${size * 0.85} ${size * 0.65} Q${size * 0.85} ${size * 0.7} ${size * 0.8} ${size * 0.7} L${size * 0.35} ${size * 0.7} L${size * 0.25} ${size * 0.85} L${size * 0.3} ${size * 0.7} L${size * 0.25} ${size * 0.7} Q${size * 0.2} ${size * 0.7} ${size * 0.2} ${size * 0.65} Z" fill="white"/>
    <circle cx="${size * 0.75}" cy="${size * 0.25}" r="${size * 0.08}" fill="white"/>
    <circle cx="${size * 0.82}" cy="${size * 0.18}" r="${size * 0.04}" fill="white"/>
    <circle cx="${size * 0.68}" cy="${size * 0.18}" r="${size * 0.04}" fill="white"/>
  </svg>`;
}

// Write SVG files
fs.writeFileSync('/Users/prabhubeeman/buildinpublic/replex/icons/icon16.svg', createSVGIcon(16));
fs.writeFileSync('/Users/prabhubeeman/buildinpublic/replex/icons/icon48.svg', createSVGIcon(48));
fs.writeFileSync('/Users/prabhubeeman/buildinpublic/replex/icons/icon128.svg', createSVGIcon(128));

console.log('SVG icons created. Convert to PNG using online converter or imagemagick.');