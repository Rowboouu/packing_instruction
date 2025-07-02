import { sideBarLoader } from '@/components/loader/navbar-side-item-loader';
import { dashboardConfig } from '@/config/dashboard';
import { UserResource } from '@/features/auth';
import { useGetGroups } from '@/features/groups';
import { NavItemWithChildren } from '@/types';
import React from 'react';

interface UseGetSibarNavigation {
  user?: UserResource | null | undefined;
}

export function useGetSibarNavigation({ user }: UseGetSibarNavigation) {
  const { data, isLoading } = useGetGroups();

  const groups = data || [];

  const defaultNav = dashboardConfig.sidebarNav.filter((section) => {
    return !(section.section === 'settings' && user?.permission !== 'admin');
  });

  const navigationItems = React.useMemo(() => {
    const pagesSection = defaultNav.find(
      (section) => section.section === 'pages',
    );
    if (!pagesSection) return defaultNav;

    let groupItems: NavItemWithChildren[] = [];

    if (isLoading) {
      groupItems = sideBarLoader;
    } else {
      groupItems = groups.map((group) => ({
        disabled: group._id === '',
        title: group.name,
        to: `/groups/${group._id}`,
        items: [],
      }));
    }

    const pagesItemsWithGroups = pagesSection.items.map((item) => {
      if (item.title === 'Groups' && !isLoading) {
        return { ...item, items: [...item.items, ...groupItems] };
      }
      return item;
    });

    const sectionsWithGroupItems = defaultNav.map((section) => {
      if (section.section === 'pages') {
        return { ...section, items: pagesItemsWithGroups };
      }
      return section;
    });

    return sectionsWithGroupItems;
  }, [defaultNav, groups, isLoading]);

  if (!user) return { navigationItems: [] };

  return { navigationItems };
}
