export class UserResponseDto {
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  location: string | null;
  company: string | null;
  blog: string | null;
}
