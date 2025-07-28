import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatServiceId(id: string): string {
  if (!id || typeof id !== 'string' || !id.includes('-')) return id;
  return `SVC-${id.substring(0, 6).toUpperCase()}`;
}