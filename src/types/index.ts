export * from './dog';
export * from './session';
export * from './goal';
export * from './user';

// Common utility types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
