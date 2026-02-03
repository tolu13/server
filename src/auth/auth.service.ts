import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
//import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { AuthRepository } from './auth.repository';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { $Enums, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly repo: AuthRepository,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { email, password, role } = createAuthDto;

    const hashedPassword: string = await bcrypt.hash(password, 10);

    const user = await this.repo.createUser({
      email,
      password: hashedPassword,
      role,
    });
    return user;
  }

  async login(loginDto: loginDto) {
    const user = await this.repo.Login(loginDto);
    //const {email, password} = loginDto;
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const comparePassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    console.log('Password match:', comparePassword);
    if (!comparePassword) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.signToken(user.id, user.email, user);
  }
  async signToken(
    id: string,
    email: string,
    user: {
      id: string;
      password: string;
      role: $Enums.Role;
    },
  ): Promise<{
    access_token: string;
    user: { email: string; role: Role; id: string };
  }> {
    const payload = {
      sub: id,
      email,
      id,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '60m',
      secret: secret,
    });

    return {
      user: { email, role: user.role, id: user.id },
      access_token: token,
    };
  }
}
