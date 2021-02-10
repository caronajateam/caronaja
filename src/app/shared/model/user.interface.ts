export type Role = 'ADMIN'| 'PAID' | 'FREE';

export interface User{
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  homeAdress?: {address, latitude, longitude};
  workAdress?: {address, latitude, longitude};
  photoURL?: string;
  role?: Role;
  driver?: boolean;
  ride?: number;
  number?:string;

}
