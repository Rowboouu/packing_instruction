import { Icons } from '@/components/icons';
import { NavLinkProps } from 'react-router-dom';
import { TranslationKeys } from './resources';

export interface NavItem extends NavLinkProps {
  title: string;
  translationKey?: TranslationKeys;
  disabled?: boolean;
  visible?: boolean;
  parent?: boolean;
  icon?: keyof typeof Icons;
  info?: string;
  as?: React.ElementType;
  collpase?: boolean;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export type SidebarNavItem = {
  section: string;
  translationKey: TranslationKeys;
  items: NavItemWithChildren[];
};
