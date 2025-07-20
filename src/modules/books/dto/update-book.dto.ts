import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBookDto {
    @ApiProperty({ example: 'Clean Architecture', required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ example: 'Robert C. Martin', required: false })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiProperty({ example: 'Updated description', required: false })
    @IsOptional()
    @IsString()
    description?: string;
}
