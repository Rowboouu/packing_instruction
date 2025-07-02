import { AuthResources, InitialState, UserResource } from '@/features/auth';

export const deriveState = (
  authLoaded: boolean,
  state: AuthResources,
  initialState: InitialState | undefined,
) => {
  if (!authLoaded && initialState) {
    return deriveFromSsrInitialState(initialState);
  }
  return deriveFromClientSideState(state);
};

const deriveFromSsrInitialState = (initialState: InitialState) => {
  const userId = initialState.userId;
  const user = initialState.user as UserResource;

  return {
    userId,
    user,
  };
};

const deriveFromClientSideState = (state: AuthResources) => {
  const userId: string | null | undefined = state.user
    ? state.user._id
    : state.user;
  const user = state.user;

  return {
    userId,
    user,
  };
};
