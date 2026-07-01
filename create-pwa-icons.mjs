import fs from 'fs';
import { createCanvas } from 'canvas';

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background with rounded corners
  const radius = size * 0.1;
  ctx.fillStyle = '#10b981'; 
  
  // Rounded rectangle
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // White "I" letter for Imala
  ctx.fillStyle = '#ffffff';
  
  // Top bar
  ctx.fillRect(size * 0.35, size * 0.25, size * 0.3, size * 0.05);
  
  // Middle bar
  ctx.fillRect(size * 0.425, size * 0.3, size * 0.15, size * 0.4);
  
  // Bottom bar
  ctx.fillRect(size * 0.35, size * 0.7, size * 0.3, size * 0.05);

  // Decorative plant element
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.arc(size * 0.5, size * 0.8, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = size * 0.02;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size * 0.45, size * 0.83);
  ctx.quadraticCurveTo(size * 0.5, size * 0.87, size * 0.55, size * 0.83);
  ctx.stroke();

  return canvas;
}

// Create icons
const sizes = [192, 512];

try {
  sizes.forEach(size => {
    const canvas = createIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const outputPath = `./public/icons/icon-${size}.png`;
    fs.writeFileSync(outputPath, buffer);
    console.log(`✓ Created ${outputPath}`);
  });
  
  console.log('\n✨ PWA icons successfully generated!\n');
} catch (error) {
  console.error('Error:', error.message);
  console.log('\n⚠️  Canvas package not installed. Install it with:');
  console.log('   npm install canvas\n');
  console.log('Or use the convert-icons.html file in your browser to generate icons manually.\n');
}
