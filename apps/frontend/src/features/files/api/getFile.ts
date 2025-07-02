import { api } from '@/lib/axios-client';
import { QueryConfig } from '@/lib/react-query';
import { useQuery } from '@tanstack/react-query';

export async function getFileStatic(filename: string) {
  const res = await api.get(`/files/static/${filename}`, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header or use default
  const contentDisposition = res.headers['content-disposition'];
  const fileName = contentDisposition
    ? contentDisposition.split('filename=')[1].trim().replace(/"/g, '')
    : `file-${filename}`;

  const file = new File([res.data], fileName, {
    type: res.headers['content-type'],
  });

  return file;
}

type ParamFnType = Parameters<typeof getFileStatic>[0];
type QueryFnType = typeof getFileStatic;

export const getFileStaticQuery = (fileId: string) => ({
  queryKey: ['files', fileId],
  queryFn: () => getFileStatic(fileId),
});

export function useGetFileStatic(
  param: ParamFnType,
  options?: QueryConfig<QueryFnType>,
) {
  return useQuery({
    ...options,
    ...getFileStaticQuery(param),
  });
}
