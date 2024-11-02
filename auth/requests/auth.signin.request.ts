import { ApiProperty } from '@nestjs/swagger';

export class AuthSignInRequest {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
}
