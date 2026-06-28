# PWA Icon Generation Instructions

Your PWA is configured, but you need to generate the icon PNG files.

## Quick Method (Recommended)

1. Open `convert-icons.html` in your browser
2. Click "Generate Icons"
3. Download both `icon-192.png` and `icon-512.png`
4. Save them to `public/icons/` folder

## Alternative Methods

### Method 1: Use Online Converter
1. Upload `public/icons/icon-192.svg` and `public/icons/icon-512.svg` to https://cloudconvert.com/svg-to-png
2. Download the PNG files
3. Save to `public/icons/`

### Method 2: Use Design Software
- Open SVG files in Figma, Photoshop, GIMP, or Inkscape
- Export as PNG at 192x192 and 512x512
- Save to `public/icons/`

### Method 3: Command Line (if you have ImageMagick)
```bash
magick convert public/icons/icon-192.svg public/icons/icon-192.png
magick convert public/icons/icon-512.svg public/icons/icon-512.png
```

## Temporary Workaround

For testing, you can use any 192x192 and 512x512 PNG images and rename them appropriately.

Once icons are in place, run:
```bash
npm run build
npm run preview
```
