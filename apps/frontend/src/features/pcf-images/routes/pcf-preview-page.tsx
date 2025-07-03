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
      <div className="grid grid-cols-3 gap-4 items-center">
        {/* Left column - empty spacer */}
        <div></div>

        {/* Center column - Action buttons */}
        <div className="flex items-center justify-between space-x-4">
          <NavLink
            to={{
              pathname: '/emails',
              search: `${EMAIL_REDIRECT_KEY}=${assortment._id}`,
            }}
            className="uppercase font-semibold text-sm hidden" // d-none equivalent
          >
            <Icons.Send width={16} height={16} />
            <span className="ml-2">SEND AS EMAIL</span>
          </NavLink>

          <ReportButton
            itemId={assortment._id}
            itemType="item"
            reportType="pdf"
          >
            <div className="flex items-center">
              <Icons.ShareO1 width={16} height={16} />
              <span className="ml-2">{t(`keyButton_download.pdfForm`)}</span>
            </div>
          </ReportButton>

          <ReportButton
            itemId={assortment._id}
            itemType="item"
            reportType="excel"
          >
            <div>
              <div className="flex items-center">
                <Icons.ShareO1 width={16} height={16} />
                <span className="ml-2">
                  {t(`keyButton_download.excelForm`)}
                </span>
              </div>
            </div>
          </ReportButton>
        </div>

        {/* Right column - Approve button */}
        <div className="flex justify-end">
          <Button
            variant={'success'}
            onClick={handleApprovedClick}
            disabled={assortment.status === 'approved'}
            className="flex items-center"
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
            <span className="ml-2">{t(`keyButton_approved`)}</span>
          </Button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden flex justify-center bg-white p-5 rounded-xl">
        <PreviewPDFContainer
          assortment={assortment as unknown as AssortmentPCF}
        />
      </div>
    </>
  );
}
