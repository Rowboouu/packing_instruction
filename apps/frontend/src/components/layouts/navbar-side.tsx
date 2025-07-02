import React from 'react';
import { NavLink } from 'react-router-dom';

import { Icons } from '@/components/icons';
import { useSideBarStore } from '@/lib/store/sideBarStore';
import { cn } from '@/lib/utils';
import { NavItemWithChildren } from '@/types';
import { useTranslation } from 'react-i18next';
import { dashboardConfig } from '@/config/dashboard'; // Import the actual config

export function SideNavBar() {
  const { t } = useTranslation();
  const { isSideBarShow } = useSideBarStore();

  // Use the actual dashboard configuration
  const navigationItems = dashboardConfig.sidebarNav;

  return (
    <nav className="navbar navbar-vertical navbar-expand-lg">
      <div
        className={cn('collapse navbar-collapse', isSideBarShow ? 'show' : '')}
        id="navbarVerticalCollapse"
      >
        <div className="navbar-vertical-content">
          <ul className="navbar-nav flex-column" id="navbarVerticalNav">
            {navigationItems.map((section: any, sIdx: number) => {
              return (
                <li className="nav-item" key={sIdx}>
                  {section.section && (
                    <>
                      <p className="navbar-vertical-label">
                        {t(section.translationKey)}
                      </p>
                      <hr className="navbar-vertical-line" />
                    </>
                  )}
                  {section.items.map((item: any, iIdx: number) => (
                    <NavLinkItem item={item} key={iIdx} />
                  ))}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="navbar-vertical-footer">
        <ToggleButton />
      </div>
    </nav>
  );
}

function ToggleButton() {
  const toggleSideBar = useSideBarStore((store) => store.toggleSideBar);

  return (
    <button
      className="btn navbar-vertical-toggle border-0 fw-semi-bold w-100 white-space-nowrap d-flex align-items-center"
      onClick={toggleSideBar}
    >
      <span className="uil uil-left-arrow-to-left fs-0"></span>
      <span className="uil uil-arrow-from-right fs-0"></span>
      <span className="navbar-vertical-footer-text ms-2">Collapsed View</span>
    </button>
  );
}

function NavLinkItem({ item }: { item: NavItemWithChildren }) {
  const [isCollapse, setCollapse] = React.useState(item.collpase || false);
  const { toggleSideBarShow, isSideBarShow } = useSideBarStore();

  if (item.items.length === 0) {
    if (item.as) {
      return <item.as />;
    }
    if (item.disabled) {
      return (
        <div
          className="nav-link opacity-50 disabled"
          style={{ cursor: 'not-allowed' }}
        >
          <div className="d-flex align-items-center">
            <span className="nav-link-text">{item.title}</span>
          </div>
        </div>
      );
    }
    return (
      <NavLink
        className={cn('nav-link', item.parent ? 'label-1' : '')}
        to={item.to}
        onClick={() => {
          if (isSideBarShow) {
            toggleSideBarShow(false);
          }
        }}
        end
      >
        <NavLinkButton item={item} />
      </NavLink>
    );
  }

  return (
    <div className="nav-item-wrapper">
      <div
        className="nav-link dropdown-indicator label-1"
        style={{ userSelect: 'none', cursor: 'pointer' }}
        aria-expanded={isCollapse}
        aria-controls="listings"
        onClick={() => setCollapse((prev) => !prev)}
      >
        <NavLinkButton item={item} />
      </div>
      <div className="parent-wrapper label-1">
        <ul
          className={cn('nav parent collapse', isCollapse ? 'show' : '')}
          data-bs-parent="#navbarVerticalCollapse"
          id={item.title}
        >
          <li className="collapsed-nav-item-title d-none">{item.title}</li>
          {item.items.map((nestedItem: any, index: number) => {
            // Parsed Item to new nested routes
            if (!nestedItem.to.toString().includes(item.to.toString())) {
              nestedItem.to = [item.to, nestedItem.to].join('/');
            }

            return (
              <li className="nav-item" key={index}>
                <NavLinkItem item={nestedItem} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function NavLinkButton({ item }: { item: NavItemWithChildren }) {
  const { t } = useTranslation();
  const hasItems = item.items.length >= 1;
  const Icon = item.icon ? Icons[item.icon] : null;

  return (
    <div className="d-flex align-items-center">
      {/* button carret if has items */}
      {hasItems && (
        <div className="dropdown-indicator-icon">
          <Icons.UCaretRight
            className="svg-inline--fa fa-caret-right"
            width="10px"
            height="10px"
          />
        </div>
      )}
      {/* button icon */}
      {Icon && (
        <span className="nav-link-icon">
          <Icon width="16px" height="16px" />
        </span>
      )}

      <span className="nav-link-text">
        {item.translationKey ? t(item.translationKey) : item.title}
      </span>

      {/* button info */}
      {item.info && (
        <span className="badge ms-2 badge badge-phoenix badge-phoenix-info ">
          {item.info}
        </span>
      )}
    </div>
  );
}