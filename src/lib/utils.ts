import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detects whether the application is running in development or production environment
 */
export function isProduction(): boolean {
  // Check if running in a browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    return hostname === 'carfolio.cc' || 
           hostname === 'www.carfolio.cc' || 
           !hostname.includes('localhost');
  }
  // Default to development if not in browser
  return false;
}

/**
 * Gets the correct demo profile URL that works in both development and production
 */
export function getDemoProfileUrl(): string {
  // For the carfolio_cc demo account
  return '/u/carfolio_cc';
}
