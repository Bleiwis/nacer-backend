import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { RepositoryResponseDto } from './dto/repository-response.dto';
import { LanguageUsageDto } from './dto/language-usage.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  async getProfile(
    @Param('username') username: string,
  ): Promise<UserResponseDto> {
    return this.userService.getGithubProfile(username);
  }

  @Get(':username/repos')
  async getRepositories(
    @Param('username') username: string,
  ): Promise<RepositoryResponseDto[]> {
    return this.userService.getGithubRepositories(username);
  }

  @Get(':username/languages')
  async getLanguages(
    @Param('username') username: string,
  ): Promise<LanguageUsageDto[]> {
    return this.userService.getUserLanguages(username);
  }
}
