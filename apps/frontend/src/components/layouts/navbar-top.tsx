import { ProfileContainer, UserResource } from '@/features/auth';
import { LanguageContainer } from '@/features/translations';
import { NotificationContainer } from '@/features/uploads';
import { useSideBarStore } from '@/lib/store/sideBarStore';

interface TopNavBarProps {
  user?: UserResource | null;
}

export function TopNavBar({ user }: TopNavBarProps) {
  const toggle = useSideBarStore((store) => store.toggleSideBarShow);

  return (
    <nav
      className="navbar navbar-top fixed-top navbar-expand"
      id="navbarDefault"
    >
      <div className="collapse navbar-collapse justify-content-between">
        <div className="navbar-logo">
          <button
            className="btn navbar-toggler navbar-toggler-humburger-icon hover-bg-transparent"
            type="button"
            onClick={() => toggle()}
          >
            <span className="navbar-toggle-icon">
              <span className="toggle-line"></span>
            </span>
          </button>
        </div>
        <div
          className="search-box navbar-top-search-box d-none d-lg-block"
          style={{ width: '25rem' }}
        ></div>
        <ul className="navbar-nav navbar-nav-icons flex-row">
          <li className="nav-item dropdown">
            <LanguageContainer user={user} />
          </li>
          <li className="nav-item dropdown">
            <NotificationContainer />
          </li>
          <li className="nav-item dropdown">
            <ProfileContainer user={user} />
          </li>
        </ul>
      </div>
    </nav>
  );
}
