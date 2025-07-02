export const STATUSES = {
  ALL: 'all',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
} as const;
export const STATUS_OPTIONS = Object.values(STATUSES);
export type StatusType = (typeof STATUSES)[keyof typeof STATUSES];
export const DEFAULT_STATUS = STATUSES.ALL;

export const VIEW_STYLE = {
  LIST: 'list',
  GRID: 'grid',
} as const;
export const VIEW_STYLE_OPTIONS = Object.values(VIEW_STYLE);
export type ViewStyle = (typeof VIEW_STYLE)[keyof typeof VIEW_STYLE];
export const DEFAULT_VIEW_STYLE = VIEW_STYLE.LIST;

export const VIEW_TYPE = {
  EDIT: 'edit',
  VIEW: 'view',
} as const;

export type ViewType = (typeof VIEW_TYPE)[keyof typeof VIEW_TYPE];

export const PAGE_SIZE = [10, 20, 30, 40, 50];
export const DEFAULT_PAGE_SIZE = PAGE_SIZE[0];
export const DEFAULT_PAGE = 1;

export const EMAIL_REDIRECT_KEY = 'redirects';
