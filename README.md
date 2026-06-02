# SightReader - Piano Sight-Reading Practice

A production-ready web application for practicing piano sight-reading with PDF sheet music.

## Features

- **PDF Import**: Upload your sheet music in PDF format
- **Automatic Measure Detection**: AI-powered barline detection
- **Manual Measure Editing**: Edit, add, move, and resize measures
- **Practice Mode**: Read at your own tempo with automatic cursor advancement
- **Hidden Measures**: Overlays previous measures as you progress
- **Auto-Scroll**: Automatic page navigation during practice
- **Local Storage**: All scores and edits saved in IndexedDB

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/raxonic1/sightreader.git
cd sightreader
npm install
npm run dev
```

The app will open at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

## Architecture

```
src/
├── components/        # React components
├── hooks/            # Custom React hooks
├── services/         # Business logic
├── store/            # Zustand stores
├── types/            # TypeScript definitions
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **PDF Rendering**: PDF.js
- **Drag & Drop**: dnd-kit
- **Animation**: Framer Motion
- **Storage**: IndexedDB + LocalStorage

## Usage

### 1. Upload a Score

- Drag & drop a PDF file or click to browse
- The app generates a thumbnail automatically

### 2. Auto-Detect Measures

- Click "Auto-Detect Measures" in the PDF viewer
- The system analyzes barlines and staff systems
- Detected measures appear in the measure order panel

### 3. Edit Measures (Optional)

- Move, resize, or delete measures
- Add missing measures manually
- Reorder measures by dragging in the side panel

### 4. Start Practice

- Click "Start Practice" to enter sight-reading mode
- Adjust BPM and visibility settings
- Press "Start" to begin
- The cursor advances automatically through measures
- Previous measures fade to black

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

## License

MIT
