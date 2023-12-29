import { v4 } from 'uuid';
import { JWTAdapter } from '../adapters';
import { SessionQueryRepository } from '../query-repositories';
import { SessionRepository } from '../repositories';

type SessionServiceArgs = {
  sessionQueryRepository: SessionQueryRepository;
  sessionRepository: SessionRepository;
  jwtAdapter: JWTAdapter;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class SessionService {
  protected sessionQueryRepository;
  protected sessionRepository;
  protected jwtAdapter;
  constructor({
    sessionQueryRepository,
    sessionRepository,
    jwtAdapter,
  }: SessionServiceArgs) {
    this.sessionQueryRepository = sessionQueryRepository;
    this.sessionRepository = sessionRepository;
    this.jwtAdapter = jwtAdapter;
  }
  async connectSession({
    ip = 'someIp',
    deviceTitle = 'defaultTitle',
    userId,
  }: {
    ip?: string;
    deviceTitle?: string;
    userId: string;
  }): Promise<{ accessToken: string; refreshToken: string } | null> {
    const existingSession =
      await this.sessionQueryRepository.getSessionByDeviceTitle(
        userId,
        deviceTitle
      );

    const deviceId = existingSession ? existingSession.deviceId : v4();

    const accessToken = await this.jwtAdapter.createJWT({ userId }, '10m');
    const refreshToken = await this.jwtAdapter.createJWT(
      { userId, deviceId },
      '20m'
    );
    const refreshTokenInfo = await this.jwtAdapter.getJWTInfo(refreshToken);

    if (!refreshTokenInfo) {
      return null;
    }

    const issueDate = new Date(refreshTokenInfo.issueDate).toISOString();
    const expiryDate = new Date(refreshTokenInfo.expiryDate).toISOString();

    let result;

    if (!existingSession) {
      result = await this.sessionRepository.createSession({
        userId,
        deviceId,
        deviceTitle,
        ip,
        issueDate,
        expiryDate,
      });
    } else {
      result = await this.sessionRepository.updateSession(userId, deviceId, {
        issueDate,
        expiryDate,
      });
    }

    if (!result) {
      return null;
    }

    return { accessToken, refreshToken };
  }

  async refreshSession(refreshToken: string): Promise<boolean> {
    const refreshTokenInfo = await this.jwtAdapter.getJWTInfo(refreshToken);

    if (!refreshTokenInfo) {
      return false;
    }

    const { userId, deviceId } = refreshTokenInfo;
    const issueDate = new Date(refreshTokenInfo.issueDate).toISOString();
    const expiryDate = new Date(refreshTokenInfo.expiryDate).toISOString();

    return this.sessionRepository.updateSession(userId, deviceId, {
      issueDate,
      expiryDate,
    });
  }

  async terminateSession(userId: string, deviceId: string): Promise<boolean> {
    return this.sessionRepository.deleteSession(userId, deviceId);
  }

  async terminateAllOtherSessions(
    userId: string,
    deviceId: string
  ): Promise<boolean> {
    return this.sessionRepository.deleteAllOtherSessions(userId, deviceId);
  }
}
