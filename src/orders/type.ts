import { Role } from '@prisma/client';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    password: string;
    role: Role;
    createdAt: Date;
  };
}
