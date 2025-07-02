import { AvatarContainer } from '@/components/container/avatar-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserResource, useSignOut } from '@/features/auth';
import useCollapsible from '@/hooks/useCollapsible';
import { cn } from '@/lib/utils';
import { CardBody, CardFooter } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface ProfileContainerProps {
  user?: UserResource | null;
}

export function ProfileContainer({ user }: ProfileContainerProps) {
  const { t } = useTranslation();

  const { containerRef, show, isCollapse, toggle } = useCollapsible();

  const signout = useSignOut();

  function handleLogoutClick() {
    close();
    signout.mutate();
  }

  if (!user) return null;

  return (
    <div ref={containerRef}>
      <button
        className={cn('btn nav-link lh-1 pe-0', show)}
        id="navbarDropdownUser"
        role="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-haspopup="true"
        aria-expanded={isCollapse}
        onClick={toggle}
      >
        <div className="avatar avatar-l ">
          <AvatarContainer name={user.name} />
        </div>
      </button>
      <div
        className={cn(
          'dropdown-menu dropdown-menu-end navbar-dropdown-caret py-0 dropdown-profile shadow border border-300',
          show,
        )}
        aria-labelledby="navbarDropdownUser"
        data-bs-popper="static"
      >
        <Card className="position-relative border-0">
          <CardBody className="p-0">
            <div className="text-center pt-4 pb-3">
              <div className="avatar avatar-xl ">
                <AvatarContainer name={user.name} />
              </div>
              <h6 className="mt-2 text-black">{user.name}</h6>
            </div>
          </CardBody>
          <CardFooter className="p-0 border-top">
            <div className="p-3">
              <Button
                variant="phoenix-secondary"
                className="d-flex flex-center w-100"
                onClick={handleLogoutClick}
              >
                <Icons.ULogout className="me-2" height="16px" width="16px" />
                {t(`keyButton_signOut`)}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
