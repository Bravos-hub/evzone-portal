export type UiTheme = {
  colors: {
    bg: {
      DEFAULT: string
      secondary: string
      subtle: string
    }
    panel: {
      DEFAULT: string
      2: string
    }
    text: {
      DEFAULT: string
      secondary: string
    }
    muted: string
    border: {
      DEFAULT: string
      light: string
    }
    accent: {
      DEFAULT: string
      hover: string
      light: string
    }
    danger: string
    ok: string
    warn: string
  }
  typography: {
    fontFamilySans: string[]
    fontFamilyMono: string[]
    baseFontSizePx: number
    lineHeight: number
  }
  radius: {
    xl: number
    '2xl': number
  }
  shadow: {
    DEFAULT: string
    lg: string
    soft: string
    card: string
    accent: string
  }
}

/**
 * Single source of truth for the UI theme.
 * Keep this aligned with:
 * - `tailwind.config.cjs` (theme tokens)
 * - `src/styles.css` (component primitives + base styles)
 */
export const theme: UiTheme = {
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
  typography: {
    fontFamilySans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
    fontFamilyMono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'monospace'],
    baseFontSizePx: 14,
    lineHeight: 1.6,
  },
  radius: {
    xl: 14,
    '2xl': 18,
  },
  shadow: {
    DEFAULT: '0 8px 24px rgba(0,0,0,.16)',
    lg: '0 14px 38px rgba(0,0,0,.22)',
    soft: '0 6px 18px rgba(0,0,0,.16)',
    card: '0 10px 30px rgba(0,0,0,.14)',
    accent: '0 6px 14px rgba(59,130,246,.25)',
  },
}

export type ThemeColorKey = keyof UiTheme['colors']


