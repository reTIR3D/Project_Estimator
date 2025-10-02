# Engineering Estimation System - Frontend

React + TypeScript frontend for the Engineering Estimation System.

## Features

- **Real-time Estimation**: See calculations update instantly as you configure parameters
- **Project Management**: Create, view, and manage estimation projects
- **Complexity Factors**: Visual checkbox interface for complexity selection
- **Quick Estimate**: Run calculations without saving a project
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8000

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ComplexityFactors.tsx
│   └── EstimationSummary.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx
│   └── ProjectEstimation.tsx
├── services/           # API service layer
│   └── api.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component with routing
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind

## Key Features

### Dashboard

- View all projects in a card grid
- Create new projects with a modal form
- See project status, hours, and confidence at a glance
- Click any project to open detailed estimation page

### Project Estimation

- **Project Size**: Choose small/medium/large
- **Complexity Factors**: Check boxes for factors like multi-discipline, fast-track, etc.
- **Client Profile**: Select client type (A/B/C/New)
- **Contingency**: Adjust with a slider (0-50%)
- **Auto-calculate**: Toggle real-time calculations
- **Results**: See total hours, duration, confidence, and detailed breakdown

### Quick Estimate

Same as project estimation but without saving to a project.

## API Configuration

The frontend is configured to proxy API requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

If your backend runs on a different URL, update `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://your-backend-url/api/v1';
```

## Usage Flow

1. **Start on Dashboard** - See all your projects
2. **Create Project** - Click "New Project" and fill in details
3. **Configure Estimation** - Select size, complexity, client profile
4. **See Results** - Real-time calculation shows hours, duration, confidence
5. **Save Project** - Click "Save Project" to persist changes

Or use "Quick Estimate" for one-off calculations without saving.

## Calculation Display

The estimation summary shows:

- **Total Hours**: Final calculated project hours
- **Duration**: Estimated weeks to complete
- **Base Hours**: Starting point before multipliers
- **Confidence**: Percentage and level (Low/Medium/High/Very High)
- **Breakdown**: Detailed formula with all multipliers

## Styling

Uses Tailwind CSS utility classes for rapid development:

- Cards with hover effects for interactivity
- Color-coded status badges
- Gradient backgrounds for key metrics
- Sticky positioning for estimation summary
- Responsive grid layouts

## Development

### Available Scripts

```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Pages

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add navigation from existing pages

### Adding API Endpoints

1. Add types to `src/types/index.ts`
2. Add API functions to `src/services/api.ts`
3. Use in components with async/await

## Troubleshooting

### API Connection Issues

If you get CORS or connection errors:

1. Make sure backend is running on port 8000
2. Check `vite.config.ts` proxy configuration
3. Verify `API_BASE_URL` in `src/services/api.ts`

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## Future Enhancements

- Risk analysis page with Monte Carlo simulation
- Resource allocation charts
- Export to Excel/PDF
- Historical data and trends
- User authentication UI
- Dark mode support

## License

Proprietary - All rights reserved