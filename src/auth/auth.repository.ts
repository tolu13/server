import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { loginDto } from './dto/login.dto';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  createUser = async (createAuthDto: CreateAuthDto): Promise<User> => {
    try {
      const user = await this.prisma.user.create({
        data: {
          email: createAuthDto.email,
          password: createAuthDto.password,
          role: createAuthDto.role,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'Email already registered, please login',
          );
        }
      }
      throw error;
    }
  };

  Login = async (loginDto: loginDto): Promise<User> => {
    try {
      console.error('login', loginDto.email);
      const user = await this.prisma.user.findUnique({
        where: {
          email: loginDto.email,
        },
        select: {
          password: true,
          id: true,
          role: true,
          createdAt: true,
          email: true,
        },
      });
      console.error('User found:', user);
      if (!user) throw new UnauthorizedException('Invalid credentials');

      return user;
    } catch (error) {
      console.error('Error in Login repository:', error);
      throw error;
    }
  };
}
