import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constant/query-key';
import { useModalStore } from '@/lib/store/modalStore';
import { User, useEditUser } from '..';

interface UpdateUserProps {
  user: User;
}

export function UserActivateButton({ user }: UpdateUserProps) {
  const queryClient = useQueryClient();

  const { mutate } = useEditUser({
    onSuccess: () => {
      toast.success('User activated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
    },
    onError: (error) => {
      const res = error.response;
      const message = res?.data?.message || error.message;
      toast.error(message);
    },
  });

  function handleMutate() {
    mutate({
      ...user,
      isActive: true,
    });
  }

  return (
    <button className="dropdown-item border-top" onClick={handleMutate}>
      Activate
    </button>
  );
}

export function UserDeactivateButton({ user }: UpdateUserProps) {
  const queryClient = useQueryClient();
  const { setModal, closeModal } = useModalStore();

  const { mutate, isPending } = useEditUser({
    onSuccess: () => {
      toast.success('User deactivated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.USERS] });
      closeModal();
    },
    onError: (error) => {
      const res = error.response;
      const message = res?.data?.message || error.message;
      toast.error(message);
    },
  });

  function handleMutate() {
    mutate({
      ...user,
      isActive: false,
    });
  }

  function handleDeactivateClick() {
    setModal({
      component: {
        title: 'Deactive this User?',
        body: 'This action can be reversed later if needed.',
        footer: (
          <>
            <Button variant="danger" onClick={handleMutate}>
              {isPending ? (
                <Icons.LoaderSpinner
                  height={16}
                  width={16}
                  className="custom-spinner"
                />
              ) : null}
              <span className="px-2">Deactivate</span>
            </Button>
            <Button variant="outline-secondary" onClick={closeModal}>
              Cancel
            </Button>
          </>
        ),
      },
      option: {},
    });
  }

  return (
    <button
      className="dropdown-item text-danger border-top"
      onClick={handleDeactivateClick}
    >
      Deactivate
    </button>
  );
}
