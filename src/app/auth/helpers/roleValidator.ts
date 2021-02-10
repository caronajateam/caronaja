import { User } from './../../shared/model/user.interface';

export class RoleValidator{
  isAdmin(user: User): boolean {
    return user.role  === 'ADMIN';
  };
}
