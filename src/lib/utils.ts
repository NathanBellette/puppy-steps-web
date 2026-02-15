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

export function getAgeInMonths(birthDate: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44); // Average days per month
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

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
