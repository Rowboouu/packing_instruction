import { NavItemWithChildren } from '@/types';

export function SideBarItemLoader() {
  return (
    <a className="nav-link placeholder-glow" href="#">
      <div className="d-flex align-items-center">
        <span
          className="placeholder rounded-2 nav-link-text"
          style={{ height: '16px', width: '120px' }}
        ></span>
      </div>
    </a>
  );
}

export const sideBarLoader: NavItemWithChildren[] = Array.from(
  { length: 3 },
  (_, i) => ({
    items: [],
    title: `loader${i}`,
    to: '#',
    as: SideBarItemLoader,
  }),
);
