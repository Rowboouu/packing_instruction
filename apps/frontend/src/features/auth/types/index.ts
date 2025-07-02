export interface UserResource {
  _id: string;
  name: string;
  email: string;
  isActive: boolean;
  role: string;
  permission: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Excludes any non-serializable prop from an object
 */
export type Serializable<T> = {
  [K in keyof T as IsSerializable<T[K]> extends true ? K : never]: T[K];
};

// eslint-disable-next-line @typescript-eslint/ban-types
export type IsSerializable<T> = T extends Function ? false : true;

export type ServerGetTokenOptions = { template?: string };
export type ServerGetToken = (
  options?: ServerGetTokenOptions,
) => Promise<string | null>;

export type InitialState = Serializable<{
  userId: string | undefined;
  user: UserResource | undefined | null;
}>;

export interface AuthResources {
  user?: UserResource | null;
}
