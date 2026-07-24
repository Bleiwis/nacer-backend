import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { UserResponseDto } from './dto/user-response.dto';
import { RepositoryResponseDto } from './dto/repository-response.dto';
import { LanguageUsageDto } from './dto/language-usage.dto';
import { GithubUserResponse } from './interfaces/github-user.interface';
import { GithubRepoRawResponse } from './interfaces/github-repo.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getHeaders(): Record<string, string> {
    const token = this.configService.get<string>('GITHUB_TOKEN');
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'NestJS-Github-App',
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    return headers;
  }

  async getGithubProfile(username: string): Promise<UserResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<GithubUserResponse>(
          `https://api.github.com/users/${encodeURIComponent(username)}`,
          { headers: this.getHeaders() },
        ),
      );

      const data = response.data;

      return {
        username: data.login,
        name: data.name,
        bio: data.bio,
        avatarUrl: data.avatar_url,
        profileUrl: data.html_url,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        location: data.location,
        company: data.company,
        blog: data.blog,
      };
    } catch (error) {
      this.handleError(error, username);
    }
  }

  async getGithubRepositories(
    username: string,
  ): Promise<RepositoryResponseDto[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<GithubRepoRawResponse[]>(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
          { headers: this.getHeaders() },
        ),
      );

      return response.data.map((repo) => ({
        name: repo.name,
        description: repo.description,
        htmlUrl: repo.html_url,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        updatedAt: repo.updated_at,
        isPrivate: repo.private,
      }));
    } catch (error) {
      this.handleError(error, username);
    }
  }

  async getUserLanguages(username: string): Promise<LanguageUsageDto[]> {
    const repos = await this.getGithubRepositories(username);
    const counts: Record<string, number> = {};
    let totalWithLanguage = 0;

    repos.forEach((repo) => {
      if (repo.language) {
        counts[repo.language] = (counts[repo.language] || 0) + 1;
        totalWithLanguage++;
      }
    });

    if (totalWithLanguage === 0) return [];

    return Object.entries(counts)
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / totalWithLanguage) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }

  private handleError(error: unknown, username: string): never {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new NotFoundException(
          `El usuario de GitHub '${username}' no existe.`,
        );
      }

      this.logger.error(
        `Error consumiendo API de GitHub para '${username}': ${error.message}`,
        error.stack,
      );

      throw new BadGatewayException(
        'Error al comunicarse con la API pública de GitHub.',
      );
    }

    this.logger.error(
      `Error inesperado en UserService para '${username}': ${error}`,
    );
    throw new InternalServerErrorException('Error interno del servidor.');
  }
}
