import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: string) {
  const now = Date.now()
  const past = new Date(date).getTime()
  const diffMs = now - past

  // Future dates? Return a simple fallback
  if (diffMs < 0) return "In the future"

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return "Just now"
  } else if (minutes < 60) {
    return minutes === 1 ? "1 min ago" : `${minutes} mins ago`
  } else if (hours < 24) {
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  } else {
    return days === 1 ? "1 day ago" : `${days} days ago`
  }
}
