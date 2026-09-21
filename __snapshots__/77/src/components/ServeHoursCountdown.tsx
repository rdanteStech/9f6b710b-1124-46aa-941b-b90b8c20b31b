import { useEffect, useState } from 'react'
import { Clock, Moon, Sun } from 'lucide-react'
import { DEFAULT_RESTAURANT_CONFIG } from '../data/systemConfig'
import {
  formatCountdown,
  formatTargetTime,
  getRestaurantHoursState,
  type RestaurantHoursState,
} from '../lib/restaurantHours'

interface ServeHoursCountdownProps {
  openingTime?: string
  closingTime?: string
  compact?: boolean
}

export default function ServeHoursCountdown({
  openingTime = DEFAULT_RESTAURANT_CONFIG.openingTime,
  closingTime = DEFAULT_RESTAURANT_CONFIG.closingTime,
  compact = false,
}: ServeHoursCountdownProps) {
  const [state, setState] = useState<RestaurantHoursState>(() =>
    getRestaurantHoursState(openingTime, closingTime),
  )

  useEffect(() => {
    const tick = () => setState(getRestaurantHoursState(openingTime, closingTime))
    tick()
    const interval = window.setInterval(tick, 1000)
    return () => window.clearInterval(interval)
  }, [openingTime, closingTime])

  const isClosing = state.mode === 'closing'
  const urgent = isClosing && state.remainingMs <= 60 * 60 * 1000
  const Icon = isClosing ? (urgent ? Clock : Moon) : Sun

  const accent = isClosing
    ? urgent
      ? { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.28)' }
      : { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.28)' }
    : { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.28)' }

  const label = isClosing ? 'Cierre en' : 'Apertura en'
  const targetLabel = isClosing ? 'Cierra' : 'Abre'

  if (compact) {
    const time = formatCountdown(state.remainingMs)

    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0"
        style={{
          background: accent.bg,
          border: `1px solid ${accent.border}`,
          boxShadow: `0 0 12px ${accent.border}`,
          minWidth: '7rem',
        }}
        title={`${targetLabel} a las ${formatTargetTime(state.target)}`}
        role="status"
        aria-live="polite"
        aria-label={`${label} ${time}`}
        data-testid="serve-hours-countdown"
      >
        <Icon size={14} style={{ color: accent.color, flexShrink: 0 }} aria-hidden />
        <span
          className="text-[10px] font-bold uppercase tracking-wide leading-none"
          style={{ color: accent.color }}
        >
          {isClosing ? 'Cierre' : 'Apertura'}
        </span>
        <span
          className={`text-sm font-black tabular-nums tracking-wide leading-none ${urgent ? 'animate-pulse' : ''}`}
          style={{ color: accent.color }}
        >
          {time}
        </span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-3 px-4 py-2 rounded-xl"
      style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent.color}18` }}
      >
        <Icon size={16} style={{ color: accent.color }} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: accent.color }}>
            {state.isOpen ? 'Local abierto' : 'Local cerrado'}
          </span>
          {state.isOpen && (
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent.color }} />
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-xs text-gastro-subtle">{label}</span>
          <span className="text-lg font-black tabular-nums tracking-wide" style={{ color: accent.color }}>
            {formatCountdown(state.remainingMs)}
          </span>
        </div>
        <div className="text-[10px] text-gastro-muted mt-0.5">
          {targetLabel} a las {formatTargetTime(state.target)}
        </div>
      </div>
    </div>
  )
}
