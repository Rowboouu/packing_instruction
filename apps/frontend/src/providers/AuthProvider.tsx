import { useQueryClient } from '@tanstack/react-query';

import { AuthResources, InitialState } from '@/features/auth';
import { getAuthUserQuery } from '@/features/auth/api/getAuthUser';
import AuthContextProvider from './AuthContextProvider';

function AuthProvider({ children }: React.PropsWithChildren) {
  const queryClient = useQueryClient();

  const query = getAuthUserQuery();
  const data = queryClient.getQueryData<AuthResources>(query.queryKey);

  const initialState: InitialState = {
    userId: data?.user?._id,
    user: data?.user,
  };

  return (
    <AuthContextProvider initialState={initialState}>
      {children}
    </AuthContextProvider>
  );
}

export default AuthProvider;
