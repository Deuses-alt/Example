import { ApiProperty } from '@nestjs/swagger';

export class AuthSignUpRequest {
  @ApiProperty()
  email: string;
  @ApiProperty()
  password: string;
  @ApiProperty()
  username: string;
}

export class AuthSignUpApproveRequest {
  @ApiProperty()
  sessionId: string;
  @ApiProperty()
  code: string;
}
