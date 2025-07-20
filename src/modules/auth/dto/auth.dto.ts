import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsString,
    IsEmail,
    IsOptional,
    IsNotEmpty,
    IsPhoneNumber,
    IsBoolean,
    Length,
    Matches,
} from 'class-validator';


export class CreateUserDto {
    @ApiProperty({ description: 'first name of the user' })
    @IsNotEmpty()
    @IsString()
    firstName: string;
    @ApiProperty({ description: 'last name of the user' })
    @IsNotEmpty()
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'Username of the user' })
    @IsNotEmpty()
    @IsString()
    username: string;

    @ApiProperty({ description: 'Phone number of the user' })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;

    @ApiProperty({ description: 'Email address of the user' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Password for authentication' })
    @IsNotEmpty()
    @IsString()
    password: string;

}


export class JwtSignInDTO {
    @ApiPropertyOptional({
        description: 'The email of the user',
        example: 'example@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'The username of the user',
        example: '@devwizard',
    })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({
        description: 'The phone number of the user',
        example: '+1234567890',
    })
    @IsOptional()
    @IsPhoneNumber()
    phoneNumber?: string;

    @ApiProperty({
        description: 'The password of the user',
        example: 'Password123!',
    })
    @IsString()
    password: string;
}


export class UpdateUserDto {
    @ApiProperty({ example: 'johndoe', description: 'Unique username', required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ example: 'John', required: false })
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiProperty({ example: 'Doe', required: false })
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiProperty({ example: 'johndoe@gmail.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: '+1234567890', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiProperty({ example: 'NewStrongP@ssword1', required: false })
    @IsOptional()
    password?: string;
}
