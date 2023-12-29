import { Request, Response } from 'express';
import { HttpStatusCode } from '../constants';
import { SessionQueryRepository } from '../query-repositories';
import { ExpiredTokenService, SessionService } from '../services';
import { DeviceViewModel, RequestWithParams } from '../types';
import { mapSessionToViewModel } from '../utils';

type SessionParams = {
  deviceId: string;
};

type SessionControllerArgs = {
  sessionQueryRepository: SessionQueryRepository;
  sessionService: SessionService;
  expiredTokenService: ExpiredTokenService;
};

export class SessionController {
  protected sessionQueryRepository;
  protected sessionService;
  protected expiredTokenService;
  constructor({
    sessionQueryRepository,
    sessionService,
    expiredTokenService,
  }: SessionControllerArgs) {
    this.sessionQueryRepository = sessionQueryRepository;
    this.sessionService = sessionService;
    this.expiredTokenService = expiredTokenService;
  }

  async getUserSessions(req: Request, res: Response<Array<DeviceViewModel>>) {
    const JWTInfo = req.JWTInfo;

    const sessions = await this.sessionQueryRepository.getAllSessionsForUser(
      JWTInfo!.userId
    );

    res
      .status(HttpStatusCode.Success)
      .json(sessions.map(mapSessionToViewModel));
  }

  async terminateAllOtherSessions(req: Request, res: Response) {
    const JWTInfo = req.JWTInfo;

    await this.sessionService.terminateAllOtherSessions(
      JWTInfo!.userId,
      JWTInfo!.deviceId
    );

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async terminateSession(req: RequestWithParams<SessionParams>, res: Response) {
    await this.sessionService.terminateSession(
      req.JWTInfo!.userId,
      req.params.deviceId
    );

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
