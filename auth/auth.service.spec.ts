import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from 'src/sessions/sessions.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let sessionsService: SessionsService;
  let cacheManager: Cache;
  let jwtService: JwtService;

  beforeEach(async () => {
    const mockJwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOne: jest.fn(),
            findOneByUsername: jest.fn(),
            create: jest.fn(),
            updatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: SessionsService,
          useValue: {
            create: jest.fn(),
            findOneByRefresh: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            set: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    sessionsService = module.get<SessionsService>(SessionsService);
    cacheManager = module.get(CACHE_MANAGER);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('Определение', () => {
    expect(service).toBeDefined();
  });

  describe('signUp', () => {
    it('Регистрация при валидных данных', async () => {
      const request = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'validpassword',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);
      jest.spyOn(userService, 'findOneByUsername').mockResolvedValue(null);
      jest.spyOn(cacheManager, 'set').mockResolvedValue(undefined);

      const result = await service.signUp(request);
      expect(result).toHaveProperty('sessionId');
    });

    it('Регистрация с существующим email', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue({} as any);
      const request = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'validpassword',
      };

      await expect(service.signUp(request)).rejects.toThrow(
        new BadRequestException('Неправильный email', {
          description: 'Email Занят',
        }),
      );
    });

    it('Регистрация со слабым паролем', async () => {
      const request = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'short',
      };

      await expect(service.signUp(request)).rejects.toThrow(
        new BadRequestException('Неправильный password', {
          description: 'Не валидный Password',
        }),
      );
    });
  });

  describe('signUpApprove', () => {
    it('Подтверждение регистрации при существующей сессии', async () => {
      const sessionId = uuidv4();
      const code = '123456';
      const request = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'validpassword',
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue({
        email: request.email,
        password: request.password,
        username: request.username,
        code: code,
      });
      jest
        .spyOn(userService, 'create')
        .mockResolvedValue({ uuid: 'user-uuid' } as any);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('access-token' as any);
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockResolvedValue('refresh-token' as any);
      jest.spyOn(sessionsService, 'create').mockResolvedValue(undefined);

      const result = await service.signUpApprove(sessionId, code);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('Подтверждение регистрации при несуществующей сессии', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);
      const sessionId = uuidv4();
      const code = '123456';

      await expect(service.signUpApprove(sessionId, code)).rejects.toThrow(
        new BadRequestException('Невалидная сессия или сессия не найдена'),
      );
    });

    it('Не правильный код', async () => {
      const sessionId = uuidv4();
      const code = 'wrong-code';
      const request = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'validpassword',
      };

      jest.spyOn(cacheManager, 'get').mockResolvedValue({
        email: request.email,
        password: request.password,
        username: request.username,
        code: 'correct-code',
      });

      await expect(service.signUpApprove(sessionId, code)).rejects.toThrow(
        new BadRequestException('Неправильный код!'),
      );
    });
  });

  describe('signIn', () => {
    it('Логин с существующими данными', async () => {
      const request = {
        email: 'test@example.com',
        password: 'validpassword',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue({
        passwordHash: await bcrypt.hash(request.password, 10),
        uuid: 'user-uuid',
      } as any);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue('access-token' as any);
      jest
        .spyOn(service, 'generateRefreshToken')
        .mockResolvedValue('refresh-token' as any);
      jest.spyOn(sessionsService, 'create').mockResolvedValue(undefined);

      const result = await service.signIn(request);
      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('Не правильниый Email', async () => {
      const request = {
        email: 'test@example.com',
        password: 'validpassword',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue(null);

      await expect(service.signIn(request)).rejects.toThrow(
        new BadRequestException('Неверная почта!'),
      );
    });

    it('Не правильный пароль', async () => {
      const request = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      jest.spyOn(userService, 'findOne').mockResolvedValue({
        passwordHash: await bcrypt.hash('correctpassword', 10),
      } as any);

      await expect(service.signIn(request)).rejects.toThrow(
        new BadRequestException('Неверный пароль'),
      );
    });
  });
});
