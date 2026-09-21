interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
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

export default function Logo({ size = 'md', className = '', alt = 'Gastro360' }: LogoProps) {
  const width = WIDTHS[size]
  const height = Math.round(width * 0.333)

  return (
    <img
      src={`${import.meta.env.BASE_URL}assets/white.svg`}
      alt={alt}
      width={width}
      height={height}
      className={`object-contain object-left ${className}`}
      loading="eager"
    />
  )
}
