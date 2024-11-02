import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthSignUpApproveRequest,
  AuthSignUpRequest,
} from './requests/auth.signup.request';
import {
  AuthSignInTokenResponse,
  AuthSignUpApproveTokenResponse,
  AuthSignUpResponse,
  RefreshSessionResponse,
} from './response/auth.token.response';
import { AuthSignInRequest } from './requests/auth.signin.request';
import { Public } from './utils/auth.guard.metadata';
import { PasswordRecoveryResponse } from './response/auth.recovery.response';
import {
  PasswordRecoveryRequest,
  PasswordRecoveryApproveRequest,
  PasswordRecoveryUpdateRequest,
} from './requests/auth.recovery.request';
import { SessionRefreshRequest } from './requests/auth.session.request';
import { Cookies } from './utils/cookie.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async signUp(@Body() body: AuthSignUpRequest): Promise<AuthSignUpResponse> {
    return await this.authService.signUp(body);
  }

  @Public()
  @Post('approve/register')
  async approveSignUp(
    @Body() body: AuthSignUpApproveRequest,
  ): Promise<AuthSignUpApproveTokenResponse> {
    return await this.authService.signUpApprove(body.sessionId, body.code);
  }

  @Public()
  @Post('login')
  async signIn(
    @Body() body: AuthSignInRequest,
  ): Promise<AuthSignInTokenResponse> {
    return await this.authService.signIn(body);
  }

  @Public()
  @Post('recovery')
  async recoveryPassword(
    @Body() body: PasswordRecoveryRequest,
  ): Promise<PasswordRecoveryResponse> {
    return await this.authService.passwordRecovery(body.email);
  }

  @Public()
  @Post('approve/recovery')
  async passwordRecoveryApprove(
    @Body() body: PasswordRecoveryApproveRequest,
  ): Promise<string> {
    return await this.authService.passwordRecoveryApprove(
      body.sessionId,
      body.code,
    );
  }

  @Public()
  @Patch('approve/update')
  async passwordRecoveryUpdate(
    @Body() body: PasswordRecoveryUpdateRequest,
  ): Promise<void> {
    await this.authService.passwordRecoveryUpdate(
      body.password,
      body.sessionId,
    );
  }

  @Public()
  @Post('refresh')
  async sessionRefresh(@Cookies('refreshToken') token: string): Promise<any> {
    return await this.authService.refreshSession(token);
  }

  @Public()
  @Delete('logout')
  async logout(@Cookies('refreshToken') token: string): Promise<any> {
    return await this.authService.logout(token);
  }
}
