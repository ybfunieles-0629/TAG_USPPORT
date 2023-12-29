import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport/dist';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any): Promise<User> {
    const { user } = payload;
    const { userId } = user;

    const userDb: User = await this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: [
        'company',
        'supplier',
        'client',
        'admin',
        'roles',
        'permissions',
        'privileges',
      ],
    });

    if (!userDb)
      throw new UnauthorizedException('Token not valid');

    if (!userDb.isActive)
      throw new UnauthorizedException('The user is not active');

    return userDb;
  }
}