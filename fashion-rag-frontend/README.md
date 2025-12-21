# 🧵 Fashion RAG - Frontend

Modern web interface for Fashion Retrieval-Augmented Generation system. Built with Next.js, React, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

## ✨ Features

- 🔍 **Multi-Modal Search**
  - Text-based search with natural language queries
  - Image-based similarity search
  - AI-powered smart search with GPT integration

- 🎨 **Modern UI/UX**
  - Dark/Light theme toggle
  - Responsive design (mobile, tablet, desktop)
  - Smooth animations and transitions
  - Loading states and error handling

- 📊 **Advanced Features**
  - Compare mode (up to 3 products)
  - Filter and sort results
  - Export results to JSON
  - Search history tracking
  - Product detail modal

- 🤖 **RAG Integration**
  - AI-generated product recommendations
  - Context-aware fashion suggestions
  - Real-time result processing

- 🛠️ **Developer Tools**
  - Debug panel with statistics
  - Performance monitoring
  - Comprehensive error logging

## 📁 Project Structure

```
fashion-rag-frontend/
├── app/                      # Next.js App Router
│   ├── page.js              # Main page (refactored)
│   ├── layout.js            # Root layout
│   ├── globals.css          # Global styles
│   └── about/               # About page
│
├── components/              # React components
│   ├── SearchForms/         # Search input components
│   │   ├── TextSearch.jsx
│   │   ├── ImageSearch.jsx
│   │   └── AISearch.jsx
│   │
│   ├── Results/             # Result display components
│   │   ├── ResultsGrid.jsx
│   │   ├── ProductCard.jsx
│   │   ├── ComparisonView.jsx
│   │   └── FilterBar.jsx
│   │
│   ├── UI/                  # Reusable UI components
│   │   ├── Modal.jsx
│   │   ├── Toast.jsx
│   │   ├── LoadingSkeleton.jsx
│   │   └── DebugPanel.jsx
│   │
│   └── Layout/              # Layout components
│       ├── Header.jsx
│       ├── Footer.jsx
│       ├── SearchHistory.jsx
│       ├── InfoSidebar.jsx
│       └── RAGOutput.jsx
│
├── hooks/                   # Custom React hooks
│   ├── useSearch.js        # Search logic & API integration
│   ├── useTheme.js         # Theme management
│   └── useToast.js         # Toast notifications
│
├── lib/                     # Utilities & configs
│   ├── api.js              # API client functions
│   └── config.js           # App configuration
│
├── public/                  # Static assets
├── REFACTORING.md          # Refactoring documentation
├── COMPONENT_SUMMARY.md    # Component details
└── TESTING_GUIDE.md        # Testing guide
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm, yarn, or pnpm
- Fashion RAG Backend running on port 8000

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dioricharrd/fashion-RAG.git
   cd fashion-RAG/fashion-rag-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   
   Create `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: Feature flags
NEXT_PUBLIC_ENABLE_DEBUG=true
```

## 📖 Usage Guide

### Text Search
1. Enter a description of the product you're looking for
2. Set the number of results (Top K)
3. Click "Search Text"
4. View results and AI recommendations

### Image Search
1. Click "Pilih Gambar" to upload an image
2. Preview your selected image
3. Click "Search Image"
4. Find visually similar products

### AI Search
1. Enter a creative prompt or detailed description
2. Let AI interpret your requirements
3. Get intelligent product matches

### Compare Mode
1. Click "Compare" button
2. Select 2-3 products to compare
3. View side-by-side comparison

### Export Results
1. Perform any search
2. Click "Export" button
3. Download results as JSON

## 🎨 Customization

### Theme

The app supports dark and light themes. Toggle using the button in the header.

```javascript
// Customize theme in hooks/useTheme.js
const theme = {
  dark: {
    mainTone: 'bg-slate-950 text-slate-50',
    cardTone: 'border-slate-800 bg-slate-900',
  },
  light: {
    mainTone: 'bg-slate-50 text-slate-900',
    cardTone: 'border-slate-200 bg-white',
  }
}
```

### Configuration

Modify constants in `lib/config.js`:

```javascript
export const DEFAULT_TOP_K = 5;        // Default number of results
export const MAX_TOP_K = 20;           // Maximum results allowed
export const MAX_HISTORY_ITEMS = 8;    // Max search history
export const MAX_COMPARE_ITEMS = 3;    // Max items to compare
export const TOAST_DURATION = 3000;    // Toast display time (ms)
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

**Quick Test:**
```bash
# Manual testing checklist
1. ✅ Text search works
2. ✅ Image search works
3. ✅ AI search works
4. ✅ Modal opens/closes
5. ✅ Compare mode functions
6. ✅ Export downloads JSON
7. ✅ Theme toggles correctly
8. ✅ History saves searches
```

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing strategies and examples

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **UI Library**: [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS 3](https://tailwindcss.com/)
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Development**: ESLint, PostCSS

## 🔗 API Integration

This frontend connects to the Fashion RAG Backend API:

**Base URL**: `http://localhost:8000`

**Endpoints Used**:
- `POST /search/text` - Text-based search
- `POST /search/image` - Image-based search
- `POST /search/ai` - AI-powered search
- `GET /image/{idx}` - Retrieve product images

See `lib/api.js` for complete API client implementation.

## 🚧 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
npx kill-port 3000
# or manually
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

**Module not found errors**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

**API connection failed**
- Ensure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify no CORS issues in browser console

**Theme not persisting**
- Check browser localStorage is enabled
- Clear browser cache and reload

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Style

This project uses ESLint for code quality:

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

**Guidelines**:
- Use functional components with hooks
- Keep components small and focused
- Use descriptive variable names
- Add comments for complex logic
- Follow React best practices

## 📄 License

This project is part of the Fashion RAG system for educational purposes.

## 👥 Team

Developed as part of TKC course project, Semester 7.

## 🔗 Links

- **Backend Repository**: [Fashion RAG Backend](../fashion-rag-backend/)
- **Main README**: [Project Root](../README.md)
- **Live Demo**: [Coming Soon]

## 📞 Support

For issues and questions:
- Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for common problems
- Review backend connection settings
- Ensure all dependencies are installed
- Check browser console for errors

---

**Built with ❤️ using Next.js, React, and Tailwind CSS**
