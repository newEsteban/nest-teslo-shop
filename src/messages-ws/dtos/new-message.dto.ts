import { IsString, MinLength } from "class-validator";

export class NewMessageDto {

    @IsString()
    @MinLength(1)
    id: string;

    @IsString()
    @MinLength(3)
    message: string;
}