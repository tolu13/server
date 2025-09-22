import { AuthGuard } from '@nestjs/passport';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super();
  }
}
