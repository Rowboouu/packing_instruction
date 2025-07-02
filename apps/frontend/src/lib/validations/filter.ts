import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_STATUS,
  DEFAULT_VIEW_STYLE,
  STATUSES,
  VIEW_STYLE,
} from '@/constant';
import * as z from 'zod';

export const filterKeySchema = z.object({
  view_style: z.nativeEnum(VIEW_STYLE).default(DEFAULT_VIEW_STYLE),
  keyword: z.string().optional(),
  page: z.coerce.number().default(DEFAULT_PAGE),
  status: z.nativeEnum(STATUSES).default(DEFAULT_STATUS),
  per_page: z.coerce.number().default(DEFAULT_PAGE_SIZE),
});
