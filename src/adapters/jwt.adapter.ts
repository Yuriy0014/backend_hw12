import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || '123';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export class JWTAdapter {
  async createJWT(
    payload: Record<string, unknown>,
    expiresIn: string
  ): Promise<string> {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  async getUserIdByToken(token: string): Promise<string | null> {
    try {
      const result = jwt.verify(token, JWT_SECRET);

      if (typeof result === 'string') {
        return null;
      }

      return new ObjectId(result.userId).toString();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        console.log('Error: ', error.message);
      }

      return null;
    }
  }

  async getJWTInfo(token: string): Promise<{
    userId: string;
    deviceId: string;
    expiryDate: number;
    issueDate: number;
  } | null> {
    try {
      const result = jwt.verify(token, JWT_SECRET);

      if (!result || typeof result === 'string' || !result.exp || !result.iat) {
        return null;
      }

      return {
        userId: result.userId,
        deviceId: result.deviceId,
        expiryDate: result.exp * 1000,
        issueDate: result.iat * 1000,
      };
    } catch (error) {
      return null;
    }
  }
}
