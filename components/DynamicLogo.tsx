'use client'

import { useTheme } from './ThemeProvider'

interface DynamicLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function DynamicLogo({ size = 'md', className = '' }: DynamicLogoProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  }

  const imageSizeClasses = {
    sm: 'h-4',
    md: 'h-5',
    lg: 'h-16',
    xl: 'h-24'
  }

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
    hexagon: 'rounded-lg' // We'll use clip-path for hexagon
  }

  const logoStyle: React.CSSProperties = {
    backgroundColor: theme.logo.bgColor,
    color: theme.logo.textColor,
    background: theme.logo.gradient || theme.logo.bgColor,
    clipPath: theme.logo.shape === 'hexagon'
      ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
      : undefined
  }

  // Check if icon is an image path (starts with /) or emoji/text
  const isImageIcon = theme.logo.icon.startsWith('/')

  return (
    <>
      {isImageIcon ? (
        <img
          src={theme.logo.icon}
          alt={`${theme.name} logo`}
          className={`${imageSizeClasses[size]} w-auto ${className}`}
        />
      ) : (
        <div
          className={`
            ${sizeClasses[size]}
            ${shapeClasses[theme.logo.shape]}
            flex items-center justify-center
            font-bold
            transition-all duration-300
            shadow-md hover:shadow-lg
            transform hover:scale-105
            overflow-hidden
            ${className}
          `}
          style={logoStyle}
        >
          {theme.logo.icon}
        </div>
      )}
    </>
  )
}

// Alternative text-based logo for cases where emoji might not work
export function DynamicTextLogo({ size = 'md', className = '' }: DynamicLogoProps) {
  const { theme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl'
  }

  const shapeClasses = {
    circle: 'rounded-full',
    square: 'rounded-none',
    rounded: 'rounded-lg',
    hexagon: 'rounded-lg'
  }

  // Fallback to first letter of theme name if emoji fails
  const fallbackIcon = theme.name.charAt(0).toUpperCase()

  const logoStyle: React.CSSProperties = {
    backgroundColor: theme.logo.bgColor,
    color: theme.logo.textColor,
    background: theme.logo.gradient || theme.logo.bgColor,
    clipPath: theme.logo.shape === 'hexagon'
      ? 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
      : undefined
  }

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${shapeClasses[theme.logo.shape]}
        flex items-center justify-center
        font-bold
        transition-all duration-300
        shadow-md hover:shadow-lg
        transform hover:scale-105
        ${className}
      `}
      style={logoStyle}
    >
      {fallbackIcon}
    </div>
  )
}