import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';


export class ChangePasswordDto {
    @ApiProperty({ example: 'oldPassword123', description: 'The user\'s current password' })
    oldPassword: string;

    @ApiProperty({ example: 'newSecurePassword456', description: 'The new password' })
    newPassword: string;
}
export class ResetPasswordDto {
    @ApiProperty({ example: 'newSecurePassword456', description: 'The new password' })
    password: string;
}

export class RequestResetPasswordDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsPhoneNumber()
    @IsNotEmpty()
    phoneNumber: string;
}