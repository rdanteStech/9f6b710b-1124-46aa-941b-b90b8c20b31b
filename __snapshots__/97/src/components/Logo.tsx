interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** `default` = logo.png (marca completa). `white` = versión clara para fondos oscuros con overlay. */
  variant?: 'default' | 'white'
  className?: string
  alt?: string
}

const WIDTHS = {
  xs: 100,
  sm: 130,
  md: 160,
  lg: 200,
  xl: 260,
} as const

const LOGO_FILES = {
  default: 'logo.png',
  white: 'white.png',
} as const

export default function Logo({
  size = 'md',
  variant = 'default',
  className = '',
  alt = 'Gastro360',
}: LogoProps) {
  const width = WIDTHS[size]
  const height = Math.round(width * 0.333)
  const src = `${import.meta.env.BASE_URL}assets/${LOGO_FILES[variant]}`

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
