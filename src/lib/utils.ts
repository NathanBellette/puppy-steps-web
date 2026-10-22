import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { REACTION_LABELS, ReactionLevel } from '@/types/session';
import { Dog } from '@/types/dog';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Builds a US-English date formatter with the given display options. */
const dateFormatter = (options: Intl.DateTimeFormatOptions) => (date: Date): string =>
  new Intl.DateTimeFormat('en-US', options).format(date);

export const formatDateLong = dateFormatter({ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const formatDate = dateFormatter({ year: 'numeric', month: 'short', day: 'numeric' });

export const formatTime = dateFormatter({ hour: 'numeric', minute: '2-digit', hour12: true });

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

const isReactionLevel = (reaction: string): reaction is ReactionLevel =>
  Object.prototype.hasOwnProperty.call(REACTION_LABELS, reaction);

export function getReactionEmoji(reaction: string): string {
  return isReactionLevel(reaction) ? reaction : '😐';
}

export function getReactionLabel(reaction: string): string {
  return REACTION_LABELS[isReactionLevel(reaction) ? reaction : '😐'];
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDogDetails(dog: Pick<Dog, 'breed' | 'age'>): string {
  return `${dog.breed} · ${dog.age} months old`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
