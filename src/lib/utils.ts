import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

export function getReactionEmoji(reaction: string): string {
  const reactions: Record<string, string> = {
    '😰': '😰',
    '😟': '😟',
    '😐': '😐',
    '😊': '😊',
    '😍': '😍',
  };
  return reactions[reaction] || '😐';
}

export function getReactionLabel(reaction: string): string {
  const labels: Record<string, string> = {
    '😰': 'Very Negative',
    '😟': 'Negative',
    '😐': 'Neutral',
    '😊': 'Positive',
    '😍': 'Very Positive',
  };
  return labels[reaction] || 'Neutral';
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

