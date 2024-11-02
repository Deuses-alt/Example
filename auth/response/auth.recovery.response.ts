import { ApiProperty } from '@nestjs/swagger';

export class PasswordRecoveryResponse {
  @ApiProperty()
  sessionId: string;
}
