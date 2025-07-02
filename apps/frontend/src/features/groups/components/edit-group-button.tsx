import { Button } from '@/components/ui/button';
import { useModalStore } from '@/lib/store/modalStore';
import { useTranslation } from 'react-i18next';
import { EditGroupForm } from '..';

type Props = React.ComponentProps<typeof EditGroupForm>;

export function EditButtonGroup(props: Props) {
  const { t } = useTranslation();
  const { setModal } = useModalStore();

  function handleOnClick() {
    setModal({
      component: {
        title: t('keyTitle_editGroup'),
        body: <EditGroupForm {...props} />,
      },
      option: {
        centered: true,
        animation: false,
        scrollable: true,
        size: 'lg',
        keyboard: false,
      },
    });
  }
  return (
    <Button size="sm" onClick={handleOnClick}>
      Edit Group
    </Button>
  );
}
