import { User } from '@prisma/client'; // or whatever your user model type is

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
