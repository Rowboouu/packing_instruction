import React, { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';

interface ReportButtonProps extends React.HTMLAttributes<HTMLAnchorElement> {
  itemType: 'item' | 'order';
  itemId: string;
  reportType?: 'pdf' | 'excel';
}

export const ReportButton = forwardRef<HTMLAnchorElement, ReportButtonProps>(
  ({ itemId, itemType, reportType = 'excel', ...props }, ref) => (
    <NavLink
      ref={ref}
      className={'text-uppercase fw-semi-bold fs--1'}
      to={`/api/reports/${itemType}/${itemId}?report-type=${reportType}`}
      target="_blank"
      {...props}
    />
  ),
);
