import { useTranslation } from 'react-i18next';

import { Icons } from '@/components/icons';
import { useModalStore } from '@/lib/store/modalStore';
import { CreateGroupForm } from '..';

export function CreateGroupButton() {
  const { t } = useTranslation();
  const { setModal } = useModalStore();

  function handleOnClick() {
    setModal({
      component: {
        title: t('keyTitle_createNewGroup'),
        body: <CreateGroupForm />,
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
    <button
      className="btn nav-link"
      style={{ paddingLeft: '2.65rem' }}
      onClick={handleOnClick}
    >
      <Icons.Plus />
      <span className="nav-link-text">{t('keyNavigation_createGroup')}</span>
    </button>
  );
}
