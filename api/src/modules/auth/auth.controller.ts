import { Controller, Post, Body, Get, UseGuards, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`POST /auth/login - username: ${loginDto.username}`);
    return this.authService.login(loginDto);
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: CurrentUserPayload) {
    this.logger.debug(`GET /auth/profile - userId: ${user.userId}`);
    return this.authService.getProfile(user.userId);
  }
}
