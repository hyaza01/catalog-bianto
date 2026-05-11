import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import type { Response } from 'express';
import { sha256 } from '../../common/utils/hash';
import { PrismaService } from '../../database/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type JwtPayload = {
  sub: string;
  email: string;
  role: 'ADMIN' | 'MANAGER';
};

type SessionTokens = {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
};

function parseDurationToMs(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);

  if (!match) {
    return 15 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const map: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * (map[unit] ?? 60 * 1000);
}

@Injectable()
export class AuthService {
  private readonly accessCookieName = 'bianto_access_token';
  private readonly refreshCookieName = 'bianto_refresh_token';

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private get accessSecret(): string {
    return this.configService.get<string>('jwt.accessSecret', 'change-me-access-secret');
  }

  private get refreshSecret(): string {
    return this.configService.get<string>('jwt.refreshSecret', 'change-me-refresh-secret');
  }

  private get accessExpiresIn(): string {
    return this.configService.get<string>('jwt.accessExpiresIn', '15m');
  }

  private get refreshExpiresIn(): string {
    return this.configService.get<string>('jwt.refreshExpiresIn', '7d');
  }

  private get pepper(): string {
    return this.configService.get<string>('jwt.pepper', '');
  }

  private buildCookieOptions(maxAgeMs: number): {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax';
    domain: string;
    maxAge: number;
    path: string;
  } {
    const secure = this.configService.get<boolean>('app.cookieSecure', false);
    const domain = this.configService.get<string>('app.cookieDomain', 'localhost');

    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      domain,
      maxAge: maxAgeMs,
      path: '/',
    };
  }

  private async generateTokens(payload: JwtPayload): Promise<SessionTokens> {
    const accessExpiresInSeconds = Math.floor(parseDurationToMs(this.accessExpiresIn) / 1000);
    const refreshExpiresInSeconds = Math.floor(parseDurationToMs(this.refreshExpiresIn) / 1000);

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: accessExpiresInSeconds,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: refreshExpiresInSeconds,
      }),
    ]);

    const refreshExpiresAt = new Date(Date.now() + parseDurationToMs(this.refreshExpiresIn));

    return {
      accessToken,
      refreshToken,
      refreshExpiresAt,
    };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(refreshToken),
        expiresAt,
      },
    });
  }

  private attachCookies(response: Response, tokens: SessionTokens): void {
    response.cookie(
      this.accessCookieName,
      tokens.accessToken,
      this.buildCookieOptions(parseDurationToMs(this.accessExpiresIn)),
    );

    response.cookie(
      this.refreshCookieName,
      tokens.refreshToken,
      this.buildCookieOptions(parseDurationToMs(this.refreshExpiresIn)),
    );
  }

  async login(dto: LoginDto, response: Response): Promise<{ success: boolean }> {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase());

    if (!user || !user.isActive || user.deletedAt) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const validPassword = await argon2.verify(user.passwordHash, `${dto.password}${this.pepper}`);

    if (!validPassword) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const tokens = await this.generateTokens(payload);
    await this.persistRefreshToken(user.id, tokens.refreshToken, tokens.refreshExpiresAt);
    this.attachCookies(response, tokens);

    return { success: true };
  }

  async refresh(refreshToken: string | undefined, response: Response): Promise<{ success: boolean }> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token nao enviado.');
    }

    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalido.');
    }

    const tokenHash = sha256(refreshToken);
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId: payload.sub,
        tokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!storedToken) {
      throw new ForbiddenException('Sessao expirada.');
    }

    await this.prisma.refreshToken.update({
      where: {
        id: storedToken.id,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    const tokens = await this.generateTokens(payload);
    await this.persistRefreshToken(payload.sub, tokens.refreshToken, tokens.refreshExpiresAt);
    this.attachCookies(response, tokens);

    return { success: true };
  }

  async logout(refreshToken: string | undefined, response: Response): Promise<{ success: boolean }> {
    if (refreshToken) {
      const tokenHash = sha256(refreshToken);

      await this.prisma.refreshToken.updateMany({
        where: {
          tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      });
    }

    response.clearCookie(this.accessCookieName, this.buildCookieOptions(0));
    response.clearCookie(this.refreshCookieName, this.buildCookieOptions(0));

    return { success: true };
  }

  async me(userId: string): Promise<{ id: string; name: string; email: string; role: string }> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Usuario nao encontrado.');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }
}
