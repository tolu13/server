import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString, IsEnum } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsEnum(Role)
  role!: Role;
}
