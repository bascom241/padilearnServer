export enum UserRole {
    INSTRUCTOR="instructor",
    STUDENT="student",
    ADMIN="admin"
}

export interface LoginUserData {
  email: string
  password: string 
}


export interface TokenPayload {
  id: string;
  email: string;
}


export interface RefreshTokenDto {
  refreshToken: string
}

export interface RefreshTokenPayload {
  id: string
}