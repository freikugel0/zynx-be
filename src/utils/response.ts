export const success = (message: string, data: any = {}) => ({
  message,
  data,
});

export const error = (message: string, details: any[] = []) => ({
  message,
  details,
});

export const successPaginated = (
  message: string,
  data: any[] = [],
  page: number,
  limit: number,
  total: number
) => ({
  meta: { page, limit, total },
  message,
  data,
});
