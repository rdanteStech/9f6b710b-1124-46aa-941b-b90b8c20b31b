export type HoursMode = 'closing' | 'opening'

export interface RestaurantHoursState {
  isOpen: boolean
  mode: HoursMode
  target: Date
  remainingMs: number
}

function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number)
  return { hours, minutes: minutes ?? 0 }
}

function atTime(base: Date, time: string): Date {
  const { hours, minutes } = parseTime(time)
  const result = new Date(base)
  result.setHours(hours, minutes, 0, 0)
  return result
}

export function getRestaurantHoursState(
  openingTime: string,
  closingTime: string,
  now = new Date(),
): RestaurantHoursState {
  const openToday = atTime(now, openingTime)
  let closeToday = atTime(now, closingTime)

  if (closeToday <= openToday) {
    closeToday.setDate(closeToday.getDate() + 1)
  }

  if (now < openToday) {
    const openYesterday = new Date(openToday)
    openYesterday.setDate(openYesterday.getDate() - 1)
    const closeYesterday = new Date(closeToday)
    closeYesterday.setDate(closeYesterday.getDate() - 1)

    if (now < closeYesterday && closeYesterday > openYesterday) {
      return {
        isOpen: true,
        mode: 'closing',
        target: closeYesterday,
        remainingMs: closeYesterday.getTime() - now.getTime(),
      }
    }

    return {
      isOpen: false,
      mode: 'opening',
      target: openToday,
      remainingMs: openToday.getTime() - now.getTime(),
    }
  }

  if (now < closeToday) {
    return {
      isOpen: true,
      mode: 'closing',
      target: closeToday,
      remainingMs: closeToday.getTime() - now.getTime(),
    }
  }

  const openTomorrow = new Date(openToday)
  openTomorrow.setDate(openTomorrow.getDate() + 1)

  return {
    isOpen: false,
    mode: 'opening',
    target: openTomorrow,
    remainingMs: openTomorrow.getTime() - now.getTime(),
  }
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function formatTargetTime(date: Date): string {
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
}
