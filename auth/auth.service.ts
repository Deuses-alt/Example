import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import {
  AuthSignInTokenResponse,
  AuthSignUpApproveTokenResponse,
  AuthSignUpResponse,
  RefreshSessionResponse,
} from './response/auth.token.response';
import { AuthSignUpRequest } from './requests/auth.signup.request';
import * as bcrypt from 'bcrypt';
import { AuthSignInRequest } from './requests/auth.signin.request';
import { jwtConstantsRefresh } from './constants/jwtconstants';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { v4 as uuidv4 } from 'uuid';
import { Cache } from 'cache-manager';
import { PasswordRecoveryResponse } from './response/auth.recovery.response';
import { SessionsService } from 'src/sessions/sessions.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    const passwordRegex = /^[а-яА-Яa-zA-Z0-9]{8,20}$/;
    return passwordRegex.test(password);
  }

  private validateUsername(username: string): boolean {
    const usernameRegex = /^[a-zA-Z][a-zA-Z0-9]{7,19}$/;
    return usernameRegex.test(username);
  }

  private generateRandomCode(): string {
    const characters = '0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }

  async generateRefreshToken(uuid: string): Promise<string> {
    return this.jwtService.signAsync(
      { sub: uuid },
      {
        secret: jwtConstantsRefresh.secret,
        expiresIn: jwtConstantsRefresh.expiresIn,
      },
    );
  }

  async signUp(request: AuthSignUpRequest): Promise<AuthSignUpResponse> {
    try {
      const user = await this.userService.findOne(request.email);
      const userUsername = await this.userService.findOneByUsername(
        request.username,
      );
      if (user) {
        throw new BadRequestException('Неправильный email', {
          description: 'Email Занят',
        });
      }

      if (userUsername) {
        throw new BadRequestException('Неправильный Username', {
          description: 'Username Занят',
        });
      }

      if (!this.validateEmail(request.email)) {
        throw new BadRequestException('Неправильный email', {
          description: 'Не валидный Email',
        });
      }

      if (!this.validateUsername(request.username)) {
        throw new BadRequestException('Неправильный username', {
          description: 'Не валидный Username',
        });
      }

      if (!this.validatePassword(request.password)) {
        throw new BadRequestException('Неправильный password', {
          description: 'Не валидный Password',
        });
      }

      const sessionId = uuidv4();
      const code = this.generateRandomCode();
      await this.cacheManager.set(
        sessionId,
        {
          email: request.email,
          password: request.password,
          username: request.username,
          code: code,
        },
        100000,
      );
      console.log(code);

      return {
        sessionId: sessionId,
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }

  async signUpApprove(
    sessionId: string,
    code: string,
  ): Promise<AuthSignUpApproveTokenResponse> {
    const session = (await this.cacheManager.get(sessionId)) as {
      email: string;
      password: string;
      username: string;
      code: string;
    };

    if (!session) {
      throw new BadRequestException('Невалидная сессия или сессия не найдена');
    }

    if (session.code != code) {
      throw new BadRequestException('Неправильный код!');
    }

    const request = {
      email: session.email,
      username: session.username,
      password: session.password,
    };

    const user = await this.userService.create(request);
    const refreshToken = await this.generateRefreshToken(user.uuid);
    const payload = {
      sub: user.uuid,
    };

    await this.sessionsService.create(refreshToken, user.uuid);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: refreshToken,
    };
  }

  async signIn(request: AuthSignInRequest): Promise<AuthSignInTokenResponse> {
    const user = await this.userService.findOne(request.email);
    if (!user) {
      throw new BadRequestException('Неверная почта!');
    }

    if (!(await bcrypt.compare(request.password, user.passwordHash))) {
      throw new BadRequestException('Неверный пароль');
    }
    const refreshToken = await this.generateRefreshToken(user.uuid);
    const payload = {
      sub: user.uuid,
    };

    await this.sessionsService.create(refreshToken, user.uuid);

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken: refreshToken,
    };
  }

  async passwordRecovery(email: string): Promise<PasswordRecoveryResponse> {
    const user = await this.userService.findOne(email);
    if (!user) {
      throw new BadRequestException('Неверная почта!');
    }
    const sessionId = uuidv4();
    const code = this.generateRandomCode();
    await this.cacheManager.set(
      sessionId,
      {
        email,
        code,
      },
      100000,
    );

    console.log(code);

    return {
      sessionId: sessionId,
    };
  }

  async passwordRecoveryApprove(
    sessionId: string,
    code: string,
  ): Promise<string> {
    const session = (await this.cacheManager.get(sessionId)) as {
      email: string;
      code: string;
    };

    if (!session) {
      throw new BadRequestException('Невалидная сессия или сессия не найдена');
    }

    if (session.code != code) {
      throw new BadRequestException('Неправильный код!');
    }

    await this.cacheManager.set(
      sessionId,
      {
        email: session.email,
        approve: true,
      },
      100000,
    );
    return sessionId;
  }

  async passwordRecoveryUpdate(
    password: string,
    sessionId: string,
  ): Promise<void> {
    const session = (await this.cacheManager.get(sessionId)) as {
      email: string;
      approve: boolean;
    };

    if (!session) {
      throw new BadRequestException('Невалидная сессия или сессия не найдена');
    }

    if (!session.approve) {
      throw new BadRequestException('Не одобрено!');
    }
    if (!this.validatePassword(password)) {
      throw new BadRequestException('Неправильный password', {
        description: 'Не валидный Password',
      });
    }
    const user = await this.userService.findOne(session.email);
    if (!user) return;
    await this.userService.updatePassword(password, user.uuid);
  }

  public async refreshSession(
    refreshToken: string,
  ): Promise<RefreshSessionResponse> {
    if (!refreshToken) {
      throw new BadRequestException('Нет токена!');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConstantsRefresh.secret,
      });
    } catch (err) {
      throw new BadRequestException('Истек токен!');
    }

    const session = await this.sessionsService.findOneByRefresh(refreshToken);
    if (!session) {
      throw new BadRequestException('Невалидная сессия или сессия не найдена');
    }

    const payload = {
      sub: session.userId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
    };
  }

  public async logout(refreshToken: string): Promise<void> {
    if (!refreshToken) {
      throw new BadRequestException('Нет токена!');
    }
    const session = await this.sessionsService.findOneByRefresh(refreshToken);
    if (!session) {
      throw new BadRequestException('Невалидная сессия или сессия не найдена');
    }

    await this.sessionsService.delete(refreshToken);
  }
}
