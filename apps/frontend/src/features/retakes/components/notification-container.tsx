import { Icons } from '@/components/icons';
import useCollapsible from '@/hooks/useCollapsible';
import { cn } from '@/lib/utils';
import { RetakeContainer, useGetInfiniteRetakes } from '..';

export function NotificationContainer() {
  const { containerRef, show, isCollapse, toggle } = useCollapsible();

  // TODO add a socket refresh connection here
  // const socket = useSocket();

  const dataQuery = useGetInfiniteRetakes({ isDone: 1 });

  // if (!socket || !socket.connected) return null;

  return (
    <div ref={containerRef}>
      <button
        className={cn('btn nav-link lh-1', show)}
        id="navbarDropdownNotification"
        role="button"
        data-bs-toggle="dropdown"
        data-bs-auto-close="outside"
        aria-haspopup="true"
        aria-expanded={isCollapse}
        onClick={toggle}
      >
        <Icons.Bell height="20" width="20" />
      </button>
      <div
        className={cn(
          'dropdown-menu dropdown-menu-end notification-dropdown-menu py-0 shadow border border-300 navbar-dropdown-caret',
          show,
        )}
        id="navbarDropdownNotfication"
        aria-labelledby="navbarDropdownNotfication"
        data-bs-popper="static"
      >
        <RetakeContainer dataQuery={dataQuery} />
      </div>
    </div>
  );
}
