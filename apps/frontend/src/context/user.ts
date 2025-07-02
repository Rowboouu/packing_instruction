import { UserResource } from '@/features/auth';
import { createContextAndHook } from '@/utils/createContextAndHook';

// Mock user data
const mockUser: UserResource = {
  _id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  isActive: true,
  permission: 'admin',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const [UserContext, useUserContext] = createContextAndHook<
  UserResource | null | undefined
>('UserContext');

// Export the mock user as well if needed elsewhere
export { UserContext, useUserContext, mockUser };