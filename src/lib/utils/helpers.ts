import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeFormValues<T>(values: T): T {
  if (
    values === null ||
    values === undefined ||
    typeof values !== 'object' ||
    values instanceof Date
  ) {
    return values;
  }

  if (Array.isArray(values)) {
    return values.map((item) => sanitizeFormValues(item)) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(values as Record<string, unknown>)
      .filter(([key]) => !key.startsWith('_'))
      .map(([key, value]) => [key, sanitizeFormValues(value)])
  ) as T;
}

export function truncateConverter(str: string, maxLen: number) {
  if (str.length > maxLen) {
    return str.substring(0, maxLen).split(' ').slice(0, -1).join(' ') + '...';
  }
  return str;
}

export function capitalize(str: string) {
  return String(str[0]).toUpperCase() + String(str).slice(1);
}

export function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + sizes[i];
}

/**
 * Prepend EXPO_PUBLIC_API_BASE_URL to server-relative paths (those starting with "/").
 * Absolute URLs (https://, s3://, etc.) are returned unchanged.
 */
const _apiBase = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
export function withApiBase(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith('/') ? `${_apiBase}${url}` : url;
}

/**
 * Open/download a file from the server on mobile.
 *
 * - Applies withApiBase so callers pass the raw server-relative path.
 * - Uses Linking.openURL to hand off to the system browser or viewer.
 * - s3:// URIs are skipped — they are not directly openable on device.
 */
export async function downloadFile(
  rawUrl: string | null | undefined,
  _filename?: string  // kept for API parity with the web helper
): Promise<void> {
  const { Linking, Alert } = await import('react-native');

  if (!rawUrl || rawUrl.startsWith('s3://')) return;

  const url = withApiBase(rawUrl) ?? rawUrl;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Cannot open file',
        'This file type cannot be opened on this device.',
      );
    }
  } catch {
    Alert.alert('Download failed', 'Unable to open the file. Please try again.');
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
}

export function getInitials(...texts: (string | undefined)[]): string {
  const validTexts = texts
    .filter((text): text is string => Boolean(text?.trim()))
    .map((text) => text.trim());

  if (validTexts.length === 0) return 'CN';

  if (validTexts.length > 1) {
    return validTexts.map((text) => text[0]).join('').toUpperCase();
  }

  const parts = validTexts[0].split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0][0] + (parts[0][1] ?? '')).toUpperCase();
}

export function formatString(str: string) {
  return str
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return '-';
  }
}

export const buildQueryString = (params: Record<string, any>): string => {
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => Boolean(v) !== false)
  );
  const query = new URLSearchParams(filteredParams).toString();
  return query ? `?${query}` : '';
};

export function getChangedValues<T extends Record<string, any>>(
  currentValues: T,
  initialValues: T
): Partial<T> {
  return Object.keys(currentValues).reduce((acc, key) => {
    const typedKey = key as keyof T;
    if (currentValues[typedKey] !== initialValues[typedKey]) {
      acc[typedKey] = currentValues[typedKey];
    }
    return acc;
  }, {} as Partial<T>);
}

export function isKeyUpdated<T extends Record<string, unknown>>(
  key: keyof T,
  initialValues: T,
  updatingValues: T
): boolean {
  const initial = initialValues[key];
  const updating = updatingValues[key];

  if (initial === updating) return false;
  if (initial == null && updating == null) return false;
  if (initial == null || updating == null) return true;

  if (typeof initial === 'object' && typeof updating === 'object') {
    try {
      return JSON.stringify(initial) !== JSON.stringify(updating);
    } catch {
      return true;
    }
  }

  return true;
}

export function getUpdatedKeys<T extends Record<string, unknown>>(
  initialValues: T,
  updatingValues: T
): (keyof T)[] {
  const allKeys = new Set([
    ...Object.keys(initialValues),
    ...Object.keys(updatingValues),
  ]) as Set<keyof T>;
  return [...allKeys].filter((key) => isKeyUpdated(key, initialValues, updatingValues));
}

export function getOnlyUpdatedValues<T extends Record<string, unknown>>(
  initialValues: T,
  updatingValues: T
): Partial<T> {
  const updatedKeys = getUpdatedKeys(initialValues, updatingValues);
  return updatedKeys.reduce((acc, key) => {
    acc[key] = updatingValues[key];
    return acc;
  }, {} as Partial<T>);
}
