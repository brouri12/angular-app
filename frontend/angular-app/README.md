# SkillForge - Learning Platform

An Angular-based learning platform with a modern UI/UX design, featuring course browsing, instructor profiles, and a responsive layout.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🌓 Dark/Light theme toggle
- 📱 Fully responsive design
- 🎯 Clean and intuitive navigation
- ⚡ Fast and optimized performance

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
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

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
│   │   ├── header/       # Navigation header with theme toggle
│   │   └── footer/       # Footer with links and social media
│   ├── pages/
│   │   ├── home/         # Landing page
│   │   ├── courses/      # Course listing page
│   │   └── about/        # About page
│   ├── services/
│   │   └── theme.ts      # Theme management service
│   ├── app.ts            # Root component
│   └── app.routes.ts     # Application routes
└── styles.css            # Global styles with Tailwind

```

## Technologies Used

- Angular 21
- Tailwind CSS
- TypeScript
- Angular Router
- Angular Signals (for state management)

## Color Scheme

- Primary: `rgb(0, 200, 151)` - Aqua/Turquoise
- Accent: `rgb(255, 127, 80)` - Orange Coral
- Background: White (light mode) / Dark gray (dark mode)

## License

This project is licensed under the MIT License.
