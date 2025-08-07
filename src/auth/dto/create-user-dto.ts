import {
    IsEmail,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDTO {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsString()
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'Password123',
        description: 'User password. Must have uppercase, lowercase, and a number.',
        minLength: 6,
        maxLength: 50,
    })
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message:
            'The password must have a Uppercase, lowercase letter and a number',
    })
    password: string;

    @ApiProperty({
        example: 'John Doe',
        description: 'Full name of the user',
        minLength: 3,
    })
    @IsString()
    @MinLength(3)
    fullName: string;
}
