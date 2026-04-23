# SkillForge - Back Office Admin Dashboard

An Angular-based admin dashboard for managing the SkillForge learning platform. Features a modern UI with the same design language as the frontend.

## Features

- 🎨 Modern UI matching the frontend design
- 🌓 Dark/Light theme toggle
- 📊 Dashboard with key metrics and statistics
- 📚 Course management (coming soon)
- 👥 User management (coming soon)
- 📈 Analytics (coming soon)
- 📱 Fully responsive design
- ⚡ Fast and optimized performance

## Dashboard Overview

The dashboard displays:
- **Total Students**: 12,543 (+12.5%)
- **Active Courses**: 487 (+8.2%)
- **Revenue**: $45,231 (+23.1%)
- **Completion Rate**: 94.2% (+2.4%)
- **Recent Courses Table**: Shows latest course activity

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
ng serve --port 4201
```

Navigate to `http://localhost:4201/`. The application will automatically reload if you change any of the source files.

### Build

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── sidebar/      # Navigation sidebar with menu
│   │   └── topbar/       # Top bar with search and theme toggle
│   ├── pages/
│   │   └── dashboard/    # Main dashboard with stats and tables
│   ├── services/
│   │   └── theme.ts      # Theme management service
│   ├── app.ts            # Root component
│   └── app.routes.ts     # Application routes
└── styles.css            # Global styles with Tailwind
```

## Navigation

- **Dashboard** (`/dashboard`) - Main overview with statistics
- **Courses** (`/courses`) - Course management (coming soon)
- **Users** (`/users`) - User management (coming soon)
- **Analytics** (`/analytics`) - Platform analytics (coming soon)

## Technologies Used

- Angular 21
- Tailwind CSS
- TypeScript
- Angular Router
- Angular Signals (for state management)

## Color Scheme

Same as the frontend for consistency:
- Primary: `rgb(0, 200, 151)` - Aqua/Turquoise
- Accent: `rgb(255, 127, 80)` - Orange Coral
- Background: White (light mode) / Dark gray (dark mode)

## Features in Detail

### Sidebar Navigation
- Fixed left sidebar
- SkillForge branding with gradient logo
- Menu items with icons
- Active route highlighting with gradient
- User profile section at bottom

### Top Bar
- Search functionality
- Notifications bell with indicator
- Dark/Light theme toggle
- Responsive design

### Dashboard
- 4 stat cards with trend indicators
- Recent courses table
- Hover effects and smooth transitions
- Responsive grid layout

## License

This project is licensed under the MIT License.
