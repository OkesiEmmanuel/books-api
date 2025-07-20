import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookDto {
    @ApiProperty({ example: 'Clean Architecture' })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ example: 'Robert C. Martin' })
    @IsNotEmpty()
    @IsString()
    author: string;

    @ApiProperty({ example: 'A book about SOLID principles', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
