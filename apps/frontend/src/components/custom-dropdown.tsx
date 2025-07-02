import React, { ForwardedRef } from 'react';
import { Icons } from './icons';

interface CustomDropDownProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CustomDropDown = React.forwardRef<
  HTMLDivElement,
  CustomDropDownProps
>(({ onClick, ...props }, ref) => (
  <div
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick && onClick(e); // Check if onClick is provided before calling it
    }}
    {...props}
  />
));

interface CustomDropDownToggleProps
  extends React.HTMLAttributes<HTMLAnchorElement> {}

export const CustomDropDownToggle = React.forwardRef(
  (
    { onClick, children }: CustomDropDownToggleProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => (
    <a
      href=""
      ref={ref}
      className="text-secondary d-flex align-items-center"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick(e); // Check if onClick is provided before calling it
      }}
    >
      {children}
    </a>
  ),
);

export const PCFImgDropdownToggle = React.forwardRef(
  (
    { onClick, children }: CustomDropDownToggleProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => (
    <a
      href=""
      ref={ref}
      className="btn btn-soft-primary d-flex align-items-center btn-icon"
      onClick={(e) => {
        e.preventDefault();
        onClick && onClick(e); // Check if onClick is provided before calling it
      }}
    >
      {children}
    </a>
  ),
);

export const DropdownEllipsisToggle = React.forwardRef(
  (
    props: React.HTMLAttributes<HTMLButtonElement>,
    ref: ForwardedRef<HTMLButtonElement>,
  ) => (
    <button
      ref={ref}
      {...props}
      className="btn fs--2 btn-sm dropdown-toggle dropdown-caret-none transition-none notification-dropdown-toggle"
      type="button"
    >
      <Icons.Ellipsis className="fs--2 text-900" height="10px" width="10px" />
    </button>
  ),
);
