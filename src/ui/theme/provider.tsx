import { createContext, useContext, useMemo } from 'react'
import { theme as defaultTheme, type UiTheme } from '@/ui/theme'

const ThemeContext = createContext<UiTheme>(defaultTheme)

export function ThemeProvider({
  children,
  theme,
}: {
  children: React.ReactNode
  theme?: UiTheme
}) {
  const value = useMemo(() => theme ?? defaultTheme, [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}


