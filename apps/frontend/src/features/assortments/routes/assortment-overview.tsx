import { useTranslation } from 'react-i18next';
import { useDebounceValue } from 'usehooks-ts';

import PageHeader from '@/components/page-header';
import { useTypedSearchParams } from '@/hooks/useTypedSearchParams';
import { AssortmentDataView, useGetInfiniteAssortment } from '..';

export function AssortmentList() {
  const { t } = useTranslation();

  const { params } = useTypedSearchParams();
  const [keyword] = useDebounceValue(params.keyword, 500);
  const dataQuery = useGetInfiniteAssortment({
    keyword: keyword,
    limit: params.per_page,
    page: params.page,
    status: params.status !== 'all' ? params.status : undefined,
  });

  return (
    <>
      <PageHeader>{t('keyNavigation_assortments')}</PageHeader>
      <AssortmentDataView dataQuery={dataQuery} />
    </>
  );
}
