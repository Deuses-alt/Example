import { ApiProperty } from "@nestjs/swagger";

export class PasswordRecoveryRequest {
  @ApiProperty()
  email: string;
}

export class PasswordRecoveryApproveRequest {
  @ApiProperty()
  sessionId: string;
  @ApiProperty()
  code: string;
}

export class PasswordRecoveryUpdateRequest {
  @ApiProperty()
  password: string;
  @ApiProperty()
  sessionId: string;
}
