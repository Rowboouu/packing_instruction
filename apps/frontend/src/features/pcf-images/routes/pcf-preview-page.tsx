import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { EMAIL_REDIRECT_KEY } from '@/constant';
import { Assortment, AssortmentPCF } from '@/features/assortments';
import { useEditAssortment } from '@/features/assortments/api/editAssortment';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { PreviewPDFContainer, ReportButton } from '..';

export interface PCFPreviewPageProps<T extends Assortment> {
  assortment: T;
}

export function PCFPreviewPage<T extends Assortment>({
  assortment,
}: PCFPreviewPageProps<T>) {
  const { t } = useTranslation();

  const { mutate, isPending: isMutatePending } = useEditAssortment();

  const handleApprovedClick = () => {
    mutate({ _id: assortment._id, status: 'approved' });
  };

  const searchParams = new URLSearchParams();
  searchParams.set('redirects', assortment._id);

  return (
    <>
      <div className="row">
        <div className="col"></div>
        <div className="col-5 d-flex align-items-center justify-content-between">
          <NavLink
            to={{
              pathname: '/emails',
              search: `${EMAIL_REDIRECT_KEY}=${assortment._id}`,
            }}
            className="text-uppercase fw-semi-bold fs--1 d-none"
          >
            <Icons.Send width={16} height={16} />
            <span className="ms-2">SEND AS EMAIL</span>
          </NavLink>
          <ReportButton
            itemId={assortment._id}
            itemType="item"
            reportType="pdf"
          >
            <Icons.ShareO1 width={16} height={16} />
            <span className="ms-2">{t(`keyButton_download.pdfForm`)}</span>
          </ReportButton>
          <ReportButton
            itemId={assortment._id}
            itemType="item"
            reportType="excel"
          >
            <Icons.ShareO1 width={16} height={16} />
            <span className="ms-2">{t(`keyButton_download.excelForm`)}</span>
          </ReportButton>
        </div>
        <div className="col d-flex justify-content-end">
          <Button
            variant={'success'}
            onClick={handleApprovedClick}
            disabled={assortment.status === 'approved'}
          >
            {isMutatePending ? (
              <Icons.LoaderSpinner
                height={16}
                width={16}
                className="custom-spinner"
              />
            ) : (
              <Icons.UCheck width={16} height={16} />
            )}
            <span className="ms-2">{t(`keyButton_approved`)}</span>
          </Button>
        </div>
      </div>

      <div
        className="mt-4 overflow-hidden d-flex justify-content-center simplebar-content"
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
        }}
      >
        <PreviewPDFContainer
          assortment={assortment as unknown as AssortmentPCF}
        />
      </div>
    </>
  );
}
