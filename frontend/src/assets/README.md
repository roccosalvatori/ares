# Assets Folder Structure

This folder contains all static assets (images, SVGs, etc.) organized by category.

## Folder Structure

```
assets/
├── images/
│   ├── backgrounds/     # Background images (e.g., background.jpeg)
│   ├── icons/          # Icon images (PNG, JPG, etc.)
│   └── logos/          # Logo images
└── svgs/
    ├── icons/          # SVG icons
    ├── illustrations/  # SVG illustrations
    └── logos/          # SVG logos
```

## Usage

### Images
- Place background images in `images/backgrounds/`
- Place icon images in `images/icons/`
- Place logo images in `images/logos/`

### SVGs
- Place SVG icons in `svgs/icons/`
- Place SVG illustrations in `svgs/illustrations/`
- Place SVG logos in `svgs/logos/`

## Referencing Assets

In your components or styles, reference assets using:
- `assets/images/backgrounds/background.jpeg`
- `assets/images/icons/icon-name.png`
- `assets/svgs/icons/icon-name.svg`

Example in CSS:
```css
background-image: url('assets/images/backgrounds/background.jpeg');
```

Example in HTML:
```html
<img src="assets/images/logos/logo.png" alt="Logo">
```

