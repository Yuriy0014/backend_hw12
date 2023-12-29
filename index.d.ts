declare namespace Express {
  export interface Request {
    user: {
      id: string;
      login: string;
      email: string;
      createdAt: string;
    } | null;
    JWTInfo: {
      userId: string;
      deviceId: string;
    } | null;
  }
}
