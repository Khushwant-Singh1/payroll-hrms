import { useState, useEffect } from 'react'

export interface ResponsiveState {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useResponsive(): ResponsiveState {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    const updateResponsiveState = () => {
      const width = window.innerWidth
      
      setState({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      })
    }

    updateResponsiveState()
    window.addEventListener('resize', updateResponsiveState)
    window.addEventListener('orientationchange', updateResponsiveState)

    return () => {
      window.removeEventListener('resize', updateResponsiveState)
      window.removeEventListener('orientationchange', updateResponsiveState)
    }
  }, [])

  return state
}
