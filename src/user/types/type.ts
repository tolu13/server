import { Role } from 'src/auth/enum';

export interface User {
  id: string;
  email: string;
  role: Role;
}
