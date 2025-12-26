/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0c1118',
          secondary: '#111827',
          subtle: '#161e2d',
        },
        panel: {
          DEFAULT: '#111827',
          2: '#0f1724',
        },
        text: {
          DEFAULT: '#e6ebf5',
          secondary: '#c8d0df',
        },
        muted: '#9ba7bd',
        border: {
          DEFAULT: 'rgba(255,255,255,.09)',
          light: 'rgba(255,255,255,.05)',
        },
        accent: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
          light: 'rgba(59,130,246,.15)',
        },
        danger: '#ef4444',
        ok: '#10b981',
        warn: '#f59e0b',
      },
      screens: {
        sm: '680px',
        md: '720px',
        lg: '900px',
        xl: '1100px',
        '2xl': '1300px',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        DEFAULT: '0 8px 24px rgba(0,0,0,.16)',
        lg: '0 14px 38px rgba(0,0,0,.22)',
        soft: '0 6px 18px rgba(0,0,0,.16)',
        card: '0 10px 30px rgba(0,0,0,.14)',
        accent: '0 6px 14px rgba(59,130,246,.25)',
      },
      borderRadius: {
        xl: '14px',
        '2xl': '18px',
      },
    },
  },
  plugins: [],
}

