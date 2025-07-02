import React, { forwardRef } from 'react';

interface ReportButtonProps extends React.HTMLAttributes<HTMLAnchorElement> {
  data?: Blob;
  itemId: string;
  itemName: string;
}

export const PDFReportButton = forwardRef<HTMLAnchorElement, ReportButtonProps>(
  ({ data, itemName, itemId, ...props }, ref) => {
    let url = `/api/reports/item/${itemId}?report-type=pdf`;
    if (data) {
      url = URL.createObjectURL(data);
    }

    return (
      <a
        ref={ref}
        className={'text-uppercase fw-semi-bold fs--1'}
        href={url}
        download={data ? itemName : undefined}
        target="_blank"
        {...props}
      />
    );
  },
);
