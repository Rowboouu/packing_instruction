import React from 'react';

import { UserContext } from '@/context/user';
import { AuthResources, InitialState } from '@/features/auth';
import { useGetAuthUser } from '@/features/auth/api/getAuthUser';
import { deriveState } from '@/utils/deriveState';
import { useTranslation } from 'react-i18next';

export type AuthContextProviderState = AuthResources;

interface AuthProviderProps extends React.PropsWithChildren {
  initialState?: InitialState;
}

function AuthContextProvider({ children, initialState }: AuthProviderProps) {
  const { i18n } = useTranslation();
  const { data, isLoading, error } = useGetAuthUser();

  const [state, setState] = React.useState<AuthContextProviderState>({
    ...data,
  });

  React.useEffect(() => {
    if (data) {
      setState(data);
      i18n.changeLanguage(data.user?.language ?? i18n.language);
    }
    return () => {
      setState({});
    };
  }, [data]);

  const derivedState = deriveState(!isLoading, state, initialState);
  const { user, userId } = derivedState;

  const userCtx = React.useMemo(() => ({ value: user }), [userId, user]);

  if (error) {
    throw error;
  }

  return (
    <UserContext.Provider value={userCtx}>
      {!isLoading && <>{children}</>}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAssertWrappedByAuthProvider(
  displayNameOrFn: string | (() => void),
): void {
  const ctx = React.useContext(UserContext);

  if (!ctx) {
    if (typeof displayNameOrFn === 'function') {
      displayNameOrFn();
      return;
    }

    throw new Error(
      `${displayNameOrFn} can only be used within the <AuthProvider /> component.`,
    );
  }
}

export default AuthContextProvider;
