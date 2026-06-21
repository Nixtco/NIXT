'use client'

import { useState, useEffect } from 'react'

interface ThemeConfig {
  background: string
  textMain: string
  textDim: string
  textColor: string
  borderColor: string
  bgCard: string
  bgSurface: string
  bgHover: string
}

const themeConfigs: ThemeConfig[] = [
  // 0: Default Blue-Black
  {
    background: 'radial-gradient(circle at bottom center, #001a4d 0%, #000000 85%)',
    textMain: '#ffffff',
    textDim: 'rgba(255, 255, 255, 0.6)',
    textColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgSurface: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)'
  },
  // 1: Purple-Black
  {
    background: 'radial-gradient(circle at bottom center, #2d004d 0%, #000000 85%)',
    textMain: '#ffffff',
    textDim: 'rgba(255, 255, 255, 0.6)',
    textColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgSurface: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)'
  },
  // 2: Green-Black
  {
    background: 'radial-gradient(circle at bottom center, #004d33 0%, #000000 85%)',
    textMain: '#ffffff',
    textDim: 'rgba(255, 255, 255, 0.6)',
    textColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgSurface: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)'
  },
  // 3: Dark Grey-Black
  {
    background: 'linear-gradient(to bottom, #1a1a1a, #000000)',
    textMain: '#ffffff',
    textDim: 'rgba(255, 255, 255, 0.6)',
    textColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    bgCard: 'rgba(255, 255, 255, 0.03)',
    bgSurface: 'rgba(255, 255, 255, 0.05)',
    bgHover: 'rgba(255, 255, 255, 0.08)'
  },
  // 4: Blue-White
  {
    background: 'radial-gradient(circle at bottom center, #e6f0ff 0%, #ffffff 70%)',
    textMain: '#000000',
    textDim: 'rgba(0, 0, 0, 0.6)',
    textColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    bgCard: 'rgba(0, 85, 255, 0.03)',
    bgSurface: 'rgba(0, 85, 255, 0.05)',
    bgHover: 'rgba(0, 85, 255, 0.08)'
  }
]

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState(0)

  const applyTheme = (index: number) => {
    if (typeof document === 'undefined') return
    
    const theme = themeConfigs[index]
    if (!theme) return

    document.body.style.background = theme.background
    document.body.style.backgroundAttachment = 'fixed'
    
    document.documentElement.style.setProperty('--text-white', theme.textMain)
    document.documentElement.style.setProperty('--text-dim', theme.textDim)
    document.documentElement.style.setProperty('--text-color', theme.textColor || theme.textMain)
    document.documentElement.style.setProperty('--border-color', theme.borderColor)
    document.documentElement.style.setProperty('--bg-card', theme.bgCard)
    document.documentElement.style.setProperty('--bg-surface', theme.bgSurface)
    document.documentElement.style.setProperty('--bg-hover', theme.bgHover)
  }

  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('nixt-theme')
    if (saved) {
      const index = parseInt(saved)
      // If saved theme is the white theme (4), reset to default dark theme
      if (index === 4) {
        localStorage.setItem('nixt-theme', '0')
        setCurrentTheme(0)
        applyTheme(0)
      } else if (index >= 0 && index < themeConfigs.length) {
        setCurrentTheme(index)
      }
    } else {
      applyTheme(0)
    }
  }, [])

  useEffect(() => {
    applyTheme(currentTheme)
  }, [currentTheme])

  const nextTheme = () => {
    const newTheme = (currentTheme + 1) % themeConfigs.length
    setCurrentTheme(newTheme)
    localStorage.setItem('nixt-theme', String(newTheme))
  }

  const setTheme = (index: number) => {
    if (index >= 0 && index < themeConfigs.length) {
      setCurrentTheme(index)
      applyTheme(index)
      localStorage.setItem('nixt-theme', String(index))
    }
  }

  return {
    currentTheme,
    nextTheme,
    setTheme,
    themes: themeConfigs.map(t => t.background)
  }
}

