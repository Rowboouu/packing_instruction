import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { QUERY_KEYS } from '@/constant/query-key';
import { useModalStore } from '@/lib/store/modalStore';
import { Template, useEditTemplate } from '..';

interface UpdateTemplateProps {
  template: Template;
}

export function TemplateActivateButton({ template }: UpdateTemplateProps) {
  const queryClient = useQueryClient();

  const { mutate } = useEditTemplate({
    onSuccess: () => {
      toast.success('Template activated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEMPLATES] });
    },
    onError: (error) => {
      const res = error.response;
      const message = res?.data?.message || error.message;
      toast.error(message);
    },
  });

  function handleMutate() {
    mutate({
      ...template,
      isActive: true,
    });
  }

  return (
    <button className="dropdown-item" onClick={handleMutate}>
      Activate
    </button>
  );
}

export function TemplateDeactivateButton({ template }: UpdateTemplateProps) {
  const queryClient = useQueryClient();
  const { setModal, closeModal } = useModalStore();

  const { mutate, isPending } = useEditTemplate({
    onSuccess: () => {
      toast.success('Template deactivated successfully!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TEMPLATES] });
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
      ...template,
      isActive: false,
    });
  }

  function handleDeactivateClick() {
    setModal({
      component: {
        title: 'Deactive this Template?',
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
      className="dropdown-item text-danger"
      onClick={handleDeactivateClick}
    >
      Deactivate
    </button>
  );
}
