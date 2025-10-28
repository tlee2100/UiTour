# UiTour - Travel & Accommodation Booking Platform

A modern React application for booking accommodations and tours in Vietnam.

## 🚀 Features

- **Homepage**: Beautiful landing page with search functionality
- **Tours Page**: Browse and filter tours with categories
- **Property Details**: Detailed view of accommodations
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Graceful error boundaries
- **State Management**: Context API for global state
- **Custom Hooks**: Reusable logic for localStorage and debouncing

## 🛠️ Tech Stack

- **React 19.1.1** - UI library
- **React Router DOM 7.9.4** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with custom properties
- **Iconify** - Icon library

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd uitour-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── Footer.jsx      # Site footer
│   ├── Loading.jsx     # Loading spinner
│   └── ErrorBoundary.jsx # Error handling
├── contexts/           # React Context providers
│   └── AppContext.jsx  # Global state management
├── hooks/              # Custom React hooks
│   ├── useLocalStorage.js
│   └── useDebounce.js
├── layouts/            # Layout components
│   └── MainLayout.jsx  # Main app layout
├── pages/              # Page components
│   ├── HomePage.jsx    # Landing page
│   ├── ToursPage.jsx   # Tours listing
│   └── HomeInfoPage.jsx # Property details
├── routes/             # Routing configuration
│   └── index.jsx       # Route definitions
└── assets/             # Static assets
    ├── icons/          # SVG icons
    └── mockdata/       # Sample data
```

## 🎨 Design System

The app uses a consistent design system with CSS custom properties:

```css
:root {
  --uitour-color: #00C0E8;      /* Primary brand color */
  --black: #000000;              /* Text color */
  --white: #FFFFFF;              /* Background color */
  --subtitle-color: #6B7280;     /* Secondary text */
  --hover-white: #F3F4F6;       /* Hover states */
  --hover-uitour: #00a3c4;      /* Primary hover */
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🚀 Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Built with ❤️ for the Vietnamese travel community