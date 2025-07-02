export interface PaginationResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}
