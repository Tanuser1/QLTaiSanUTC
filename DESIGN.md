# Tailwind Config Snippet

Here is the ready-to-copy theme object for `tailwind.config.js` containing all exact hex codes, fonts, shapes, and spacing scales defined in the design system.

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8f9fa',
          dim: '#d9dadb',
          bright: '#f8f9fa',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f5',
          container: '#edeeef',
          'container-high': '#e7e8e9',
          'container-highest': '#e1e3e4',
          tint: '#4f6073',
          variant: '#e1e3e4',
        },
        'on-surface': {
          DEFAULT: '#191c1d',
          variant: '#44474c',
        },
        inverse: {
          surface: '#2e3132',
          'on-surface': '#f0f1f2',
          primary: '#b7c8de',
        },
        outline: {
          DEFAULT: '#74777d',
          variant: '#c4c6cd',
        },
        primary: {
          DEFAULT: '#041627',
          container: '#1a2b3c',
          fixed: '#d2e4fb',
          'fixed-dim': '#b7c8de',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#8192a7',
          fixed: '#0b1d2d',
          'fixed-variant': '#38485a',
        },
        secondary: {
          DEFAULT: '#006a62',
          container: '#81f3e5',
          fixed: '#84f5e8',
          'fixed-dim': '#66d9cc',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#006f66',
          fixed: '#00201d',
          'fixed-variant': '#005049',
        },
        tertiary: {
          DEFAULT: '#001532',
          container: '#002957',
          fixed: '#d6e3ff',
          'fixed-dim': '#a9c7ff',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#5291ef',
          fixed: '#001b3d',
          'fixed-variant': '#00468c',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        background: '#f8f9fa',
        'on-background': '#191c1d',
        status: {
          active: '#26a69a',
          'active-light': '#4db6ac',
          maintenance: '#ef5350',
          pending: '#ffca28',
          highlight: '#fff176',
        }
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'headline-xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-bold': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'data-tabular': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '0.125rem',
        DEFAULT: '0.25rem', // 4px Standard
        md: '0.375rem',
        lg: '0.5rem',     // 8px Large Container
        xl: '0.75rem',    // 12px Status Badges/Tags
        full: '9999px',
      },
      spacing: {
        base: '8px',
        compact: '4px',
        'container-padding': '24px',
        gutter: '16px',
        'sidebar-width': '260px',
        'header-height': '64px',
      },
      boxShadow: {
        ambient: '0px 4px 12px rgba(0,0,0,0.05)',
        hover: '0px 6px 16px rgba(0,0,0,0.08)',
        modal: '0px 12px 32px rgba(0,0,0,0.20)', // Level 3 Elevation
      }
    },
  },
  plugins: [],
}
```

# Component Specs

## 1. Sidebar (Navigation)
- **Structure**: Fixed left column (Level 0 Elevation).
- **Dimensions**: `w-[260px] h-screen fixed inset-y-0 left-0`.
- **Background**: Dark Navy Blue (`bg-primary-container`).
- **Text**: `text-on-primary-container` for default links, `text-on-primary` for active headers.
- **Nav Items**:
  - Layout: `flex items-center gap-base px-gutter py-base`.
  - Default State: Transparent background.
  - Hover State: `hover:bg-primary/20 hover:text-white transition-colors`.
  - Active State: `bg-primary/40 border-l-4 border-status-active-light text-white`.
  
## 2. Header (Top Bar)
- **Structure**: Fixed top bar spanning remaining width.
- **Dimensions**: `h-[64px] w-[calc(100%-260px)] ml-[260px] fixed top-0 left-0 z-10`.
- **Background**: Solid White (`bg-surface-container-lowest`).
- **Border/Elevation**: `border-b border-surface-variant`.
- **Search Bar**: 
  - Layout: `flex items-center w-full max-w-md mx-gutter`.
  - Input: `bg-surface-container-lowest border border-outline-variant rounded px-base py-[6px] h-10 w-full focus:border-status-active focus:ring-1 focus:ring-status-active focus:outline-none transition-all`.

## 3. Main Container
- **Structure**: Scrollable area holding page content.
- **Dimensions**: `mt-[64px] ml-[260px] min-h-[calc(100vh-64px)] w-[calc(100%-260px)]`.
- **Background**: Bright White (`bg-surface-container-lowest`).
- **Padding**: `p-container-padding`.
- **Layout Model**: Fluid 12-column grid system (`grid grid-cols-12 gap-gutter`).

## 4. Forms (Login Structure)
- **Container**: Centered card (`bg-surface-container-lowest shadow-ambient rounded-lg p-container-padding`).
- **Input Fields**:
  - Base classes: `w-full bg-surface-container-lowest border border-outline-variant rounded px-base py-base text-body-md text-on-surface`.
  - Focus state: `focus:border-status-active focus:ring-1 focus:ring-status-active outline-none`.
  - Error state: `border-error focus:border-error focus:ring-error text-error`.
- **Buttons**:
  - Shape: `rounded` (4px). Font: `font-inter font-semibold text-body-md`.
  - Primary (`bg-tertiary-container` / `#1565c0` per design spec interpretation): `bg-tertiary-container text-on-tertiary hover:shadow-hover transition-shadow py-base px-gutter`.
  - Secondary: `bg-transparent border border-outline text-primary-container hover:bg-surface-container transition-colors py-base px-gutter`.

## 5. Asset Data Table
- **Container**: `bg-surface-container-lowest rounded-lg border border-surface-variant overflow-hidden shadow-ambient`.
- **Table**: `w-full text-left border-collapse text-data-tabular tabular-nums`.
- **Header (`thead`)**: 
  - Style: `bg-surface-container-low border-b border-surface-variant sticky top-0 z-10`.
  - Cells (`th`): `p-compact md:p-base text-label-bold text-on-surface-variant uppercase tracking-wider`.
- **Rows (`tr`)**:
  - Default: `border-b border-surface-variant last:border-0`.
  - Hover/Interactive: `hover:bg-primary/5 cursor-pointer transition-colors`.
  - Attention needed: `bg-status-highlight/10` (Pale Yellow).
- **Cells (`td`)**: `p-compact md:p-base text-body-md text-on-surface`.
- **Status Chips**:
  - Base: `inline-flex items-center px-base py-[2px] rounded-xl text-label-bold`.
  - Active: `bg-status-active/10 text-status-active`.
  - Maintenance: `bg-status-maintenance/10 text-status-maintenance`.
  - Pending: `bg-status-pending/20 text-status-pending`.

# Component Hierarchy

Atomic Design inspired folder structure for maintaining scalability and keeping the workspace clean:

```text
src/
├── assets/
│   └── fonts/                 # Manrope, Inter local files (if not using Google Fonts)
├── components/
│   ├── atoms/
│   │   ├── Button.tsx         # Primary, Secondary variants
│   │   ├── Input.tsx          # Base input field with focus/error states
│   │   ├── StatusChip.tsx     # Active, Maintenance, Pending
│   │   ├── Typography.tsx     # Reusable text components enforcing font families
│   │   └── Icons.tsx
│   ├── molecules/
│   │   ├── FormField.tsx      # Input + Label + Error Message
│   │   ├── SearchBar.tsx      # Header search input
│   │   ├── NavItem.tsx        # Sidebar link with active states
│   │   └── TableRow.tsx       # Standard data table row structure
│   ├── organisms/
│   │   ├── Sidebar.tsx        # Complete navigation sidebar
│   │   ├── Header.tsx         # Top bar with search and profile
│   │   ├── LoginForm.tsx      # Composed authentication form
│   │   ├── AssetTable.tsx     # Complex table with sticky headers & sorting
│   │   └── KPIWidget.tsx      # Dashboard metrics card
│   └── templates/
│       ├── MainLayout.tsx     # Assembles Sidebar, Header, and Main Container
│       └── AuthLayout.tsx     # Centered single-column layout
├── features/
│   └── assets/                # Feature-specific logic (e.g., hooks, api calls)
├── pages/
│   ├── DashboardPage.tsx      # Main dashboard view
│   ├── AssetListPage.tsx      # Full list of assets
│   └── LoginPage.tsx          # Entry point
└── index.css                  # Tailwind imports and base styles
```
