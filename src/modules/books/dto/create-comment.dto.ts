import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {

    @ApiProperty({ example: 'Great book!', description: 'Content of the comment' })
    @IsString()
    @MinLength(1)
    content: string;

    @ApiProperty({ example: 'user-id', description: 'ID of the user posting the comment' })
    @IsString()
    userId: string;
}