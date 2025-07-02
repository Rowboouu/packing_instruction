// import { useUserContext } from '@/context/user';
import { UserResource } from '@/features/auth/types';
// import { useAssertWrappedByAuthProvider } from '@/providers/AuthContextProvider';
// import { mockUser } from '@/context/user'; // Import the existing mockUser

type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };

export function useUser(): UseUserReturn {
  // Skip auth provider check and return mock user directly
  // useAssertWrappedByAuthProvider('useUser');
  // const user = useUserContext();

  // Always return signed in with existing mock user
  // return { isLoaded: true, isSignedIn: true, user: mockUser };
  return { isLoaded: true, isSignedIn: false, user: null};

  // Original logic (commented out)
  /*
  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
  */
}