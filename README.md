# Memory Verses App

A static React + Vite web application for practicing Bible memorization using the English Standard Version (ESV) Bible.

## Features

- **No Backend Required**: Fully client-side application that works in any browser
- **Two Verse Selection Methods**:
  - **Popular Verses**: Quick-select from a curated list of commonly memorized passages
  - **Manual Picker**: Browse and select any book, chapter, and verse from the entire ESV Bible
- **Memory Practice Mode**: Type verses from memory and get instant feedback
- **Progress Tracking**: Track attempts and successful recitations
- **ESV Bible Data**: Uses official ESV JSON data from the [lguenth/mdbible](https://github.com/lguenth/mdbible) repository

## Tech Stack

- **React 18**: Modern UI library
- **Vite 4**: Lightning-fast build tool
- **Pure JavaScript**: No database, no authentication, no backend required

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/RonaldMariah/bible-memory-test.git
cd bible-memory-test

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Local Preview

```bash
npm run preview
```

## Deployment to GitHub Pages

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Setup

1. Go to your repository settings
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment", select:
   - **Source**: GitHub Actions
   - This project will automatically deploy when you push to the `main` branch

### Automatic Deployment

The `.github/workflows/deploy.yml` workflow will:
- Install dependencies
- Build the React application
- Deploy to GitHub Pages on every push to `main`

Your site will be available at: `https://RonaldMariah.github.io/bible-memory-test/`

## Usage

### Popular Verses Tab
1. Click on any verse from the list
2. The verse reference will be displayed (without the text)
3. Type the verse from memory
4. Click "Check Answer" for feedback or "Show Answer" to reveal it
5. View your progress statistics

### Manual Picker Tab
1. Select a **Book** from the dropdown
2. Select a **Chapter** 
3. Select a **Verse**
4. Click "Select Verse" to begin practicing
5. Type from memory and check your answer

## Data Source

Bible verses are fetched from:
- **Repository**: https://github.com/lguenth/mdbible
- **Data**: ESV (English Standard Version) JSON files
- **Hosted**: GitHub Raw Content CDN for fast access

The app caches fetched Bible books to minimize network requests.

## Project Structure

```
bible-memory-test/
├── src/
│   ├── components/
│   │   ├── PopularVersesList.jsx    # Popular verses selection
│   │   └── VerseManualPicker.jsx    # Manual book/chapter/verse picker
│   ├── data/
│   │   ├── popularVerses.js         # Curated list of popular verses
│   │   └── bibleData.js             # Bible data fetching utilities
│   ├── App.jsx                      # Main application component
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Styling
├── public/
├── index.html                       # HTML template
├── vite.config.js                   # Vite configuration
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config (for IDE support)
└── .github/workflows/
    └── deploy.yml                   # GitHub Actions deployment workflow
```

## Popular Verses Included

The app comes with 15 popular Bible verses pre-configured:
- John 3:16
- Psalm 23:1
- Proverbs 3:5-6
- Romans 8:28
- Philippians 4:6-7
- Matthew 6:9-13 (The Lord's Prayer)
- Hebrews 4:12
- And 8 more...

You can add more verses by editing `src/data/popularVerses.js`

## Adding More Popular Verses

Edit `src/data/popularVerses.js`:

```javascript
{
  reference: "John 3:16",
  book: "John",
  chapter: 3,
  verse: 16,
  preview: "For God so loved the world, that he gave his only begotten Son..."
}
```

## Features for Future Development

- User progress persistence (localStorage)
- Custom verse lists
- Spaced repetition algorithm
- Difficulty levels
- Verse categories
- Multiple Bible versions (ESV, NIV, etc.)
- Share progress
- Dark mode

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

## Performance

- **No Backend**: Zero server latency
- **Client-Side Processing**: All operations run in your browser
- **Cached Bible Data**: Fetched books are cached in memory
- **Optimized Build**: Vite's tree-shaking and minification

## Privacy

- No user data is collected
- No tracking or analytics
- No sign-up required
- Everything runs locally in your browser

## License

MIT License - feel free to fork and modify

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on the GitHub repository.

## Acknowledgments

- [lguenth/mdbible](https://github.com/lguenth/mdbible) for the Bible data
- [Vite](https://vitejs.dev/) for the amazing build tool
- [React](https://react.dev/) for the UI library
