interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** `default` = wordmark completo. `white` = versión clara para fondos oscuros. */
  variant?: 'default' | 'white'
  /** Solo ícono (sidebar colapsado, favicons inline). */
  iconOnly?: boolean
  className?: string
  alt?: string
}

const WORDMARK_WIDTHS = {
  xs: 100,
  sm: 130,
  md: 160,
  lg: 200,
  xl: 260,
} as const

const ICON_WIDTHS = {
  xs: 28,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
} as const

/** Wordmark claro sobre fondos oscuros (landing, login, sidebar). */
const LOGO_FILES = {
  default: 'white.svg',
  white: 'white.svg',
  icon: 'logo.svg',
} as const

export default function Logo({
  size = 'md',
  variant = 'default',
  iconOnly = false,
  className = '',
  alt = 'Gastro360',
}: LogoProps) {
  const src = `${import.meta.env.BASE_URL}assets/${iconOnly ? LOGO_FILES.icon : LOGO_FILES[variant]}`
  const width = iconOnly ? ICON_WIDTHS[size] : WORDMARK_WIDTHS[size]
  const height = iconOnly ? width : Math.round(width / 3.02)

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain object-left ${className}`}
      loading="eager"
      decoding="async"
    />
  )
}
