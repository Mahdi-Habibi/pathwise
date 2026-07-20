import { IsEmail, IsString, Length, Matches, MaxLength } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @MaxLength(20)
  phone!: string;
}

export class VerifyOtpDto {
  @IsString()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class CompleteProfileDto {
  @IsString()
  @Length(2, 60)
  firstName!: string;

  @IsString()
  @Length(2, 60)
  lastName!: string;

  @IsString()
  @Length(2, 80)
  city!: string;

  @IsEmail()
  @MaxLength(120)
  email!: string;
}
