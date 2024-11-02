import { ApiProperty } from '@nestjs/swagger';

export class AuthSignUpResponse {
  @ApiProperty()
  sessionId: string;
}

export class AuthSignInTokenResponse {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}

export class AuthSignUpApproveTokenResponse {
  @ApiProperty()
  accessToken: string;
  @ApiProperty()
  refreshToken: string;
}

export class RefreshSessionResponse {
  @ApiProperty()
  accessToken: string;
}
