# IMARA - Smart Agriculture Platform

AI-powered agricultural advisory system for farmers in Rwanda. Get crop recommendations, disease detection, weather intelligence, and market insights.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # Base UI components (buttons, cards, etc.)
│   │   ├── header.tsx    # Dashboard header
│   │   ├── sidebar.tsx   # Dashboard sidebar
│   │   └── icon-3d.tsx   # 3D icon component
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx  # Landing page
│   │   └── dashboard/    # Dashboard pages
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main app component with routing
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML entry point
└── vite.config.ts        # Vite configuration
```

## Features

- 🌱 **Crop Advisory** - AI-powered crop recommendations
- 🐛 **Disease Detection** - Photo-based disease identification
- ☁️ **Weather Intelligence** - Farming-specific weather forecasts
- 🏔️ **Soil Analysis** - Comprehensive soil health assessments
- 📈 **Market Prices** - Real-time crop pricing and trends
- 📚 **Training & Education** - Video tutorials in local languages

## License

Copyright © 2024 IMARA. All rights reserved.
