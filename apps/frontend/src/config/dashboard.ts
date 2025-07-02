// import { CreateGroupButton } from '@/features/groups';
import { type SidebarNavItem } from '@/types';

export interface DashboardConfig {
  sidebarNav: SidebarNavItem[];
}

export const dashboardConfig: DashboardConfig = {
  sidebarNav: [
    {
      section: 'pages',
      translationKey: 'keySideBarSection_pages',
      items: [
        {
          title: 'Assortments',
          translationKey: 'keyNavigation_assortments',
          icon: 'UPackage',
          to: '/assortments',
          parent: true,
          items: [],
        },
        {
          title: 'Emails',
          translationKey: 'keyNavigation_emails',
          icon: 'Send',
          to: '/emails',
          parent: true,
          items: [],
        },
      ],
    },
    {
      section: 'settings',
      translationKey: 'keySideBarSection_settings',
      items: [
        {
          title: 'Configurations',
          translationKey: 'keyNavigation_configurations',
          icon: 'MaSettings',
          to: '/config',
          parent: true,
          collpase: true,
          items: [
            {
              title: 'Customers',
              translationKey: 'keyNavigation_customers',
              to: 'customers',
              items: [],
            },
            {
              title: 'Templates',
              translationKey: 'keyNavigation_templates',
              to: 'templates',
              items: [],
            },
          ],
        },
        {
          title: 'Users',
          translationKey: 'keyNavigation_users',
          icon: 'UUsers',
          to: '/users',
          parent: true,
          items: [],
        },
      ],
    },
  ],
};
