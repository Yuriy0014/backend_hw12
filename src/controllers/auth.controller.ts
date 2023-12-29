import { Request, Response } from 'express';
import { JWTAdapter } from '../adapters';
import { HttpStatusCode } from '../constants';
import { EmailManager } from '../managers';
import {
  NotConfirmedAccountQueryRepository,
  NotRecoveredPasswordQueryRepository,
  UserQueryRepository,
} from '../query-repositories';
import { AuthService, ExpiredTokenService, SessionService } from '../services';
import {
  LoginInputModel,
  LoginSuccessViewModel,
  MeViewModel,
  NewPasswordRecoveryInputModel,
  PasswordRecoveryInputModel,
  RegistrationConfirmationCodeModel,
  RegistrationEmailResending,
  RequestWithBody,
  UserInputModel,
} from '../types';

type AuthControllerArgs = {
  authService: AuthService;
  sessionService: SessionService;
  expiredTokenService: ExpiredTokenService;
  userQueryRepository: UserQueryRepository;
  notConfirmedAccountQueryRepository: NotConfirmedAccountQueryRepository;
  notRecoveredPasswordQueryRepository: NotRecoveredPasswordQueryRepository;
  emailManager: EmailManager;
  jwtAdapter: JWTAdapter;
};

export class AuthController {
  protected authService;
  protected sessionService;
  protected expiredTokenService;
  protected userQueryRepository;
  protected notConfirmedAccountQueryRepository;
  protected notRecoveredPasswordQueryRepository;
  protected emailManager;
  protected jwtAdapter;
  constructor({
    authService,
    sessionService,
    userQueryRepository,
    expiredTokenService,
    notConfirmedAccountQueryRepository,
    notRecoveredPasswordQueryRepository,
    jwtAdapter,
    emailManager,
  }: AuthControllerArgs) {
    this.authService = authService;
    this.sessionService = sessionService;
    this.userQueryRepository = userQueryRepository;
    this.expiredTokenService = expiredTokenService;
    this.notConfirmedAccountQueryRepository =
      notConfirmedAccountQueryRepository;
    this.notRecoveredPasswordQueryRepository =
      notRecoveredPasswordQueryRepository;
    this.emailManager = emailManager;
    this.jwtAdapter = jwtAdapter;
  }

  async registerUser(req: RequestWithBody<UserInputModel>, res: Response) {
    const userId = await this.authService.registerUser(req.body);

    if (!userId) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async confirmRegistration(
    req: RequestWithBody<RegistrationConfirmationCodeModel>,
    res: Response
  ) {
    const confirmationCode = req.body.code;

    const isConfirmed = await this.authService.confirmAccount(confirmationCode);

    if (!isConfirmed) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async resendRegistrationEmail(
    req: RequestWithBody<RegistrationEmailResending>,
    res: Response
  ) {
    const isUpdated = await this.authService.updateNotConfirmedAccount(
      req.body.email
    );

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    const notConfirmedAccount =
      await this.notConfirmedAccountQueryRepository.getNotConfirmedAccountByEmail(
        req.body.email
      );

    if (!notConfirmedAccount) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    const { email, confirmationCode } = notConfirmedAccount;

    await this.emailManager.sendRegistrationConfirmationMessage(
      email,
      confirmationCode
    );

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async recoverPassword(
    req: RequestWithBody<PasswordRecoveryInputModel>,
    res: Response
  ) {
    const email = req.body.email;

    const [user, notConfirmedAccount] = await Promise.all([
      this.userQueryRepository.getUserByLoginOrEmail(email),
      this.notConfirmedAccountQueryRepository.getNotConfirmedAccountByEmail(
        email
      ),
    ]);

    if (!user && !notConfirmedAccount) {
      res.sendStatus(HttpStatusCode.No_Content);
      return;
    }

    const notRecoveredPassword =
      await this.notRecoveredPasswordQueryRepository.getNotRecoveredPasswordByEmail(
        email
      );

    if (notRecoveredPassword) {
      await this.authService.updateNotRecoveredPassword(email);
      const notRecPass =
        await this.notRecoveredPasswordQueryRepository.getNotRecoveredPasswordByEmail(
          email
        );

      if (notRecPass) {
        const { confirmationCode } = notRecPass;
        await this.emailManager.sendPasswordRecoveryMessage(
          email,
          confirmationCode
        );
      }

      res.sendStatus(HttpStatusCode.No_Content);
      return;
    }

    await this.authService.recoverPassword(email);

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async confirmNewPassword(
    req: RequestWithBody<NewPasswordRecoveryInputModel>,
    res: Response
  ) {
    const { recoveryCode, newPassword } = req.body;

    const isConfirmed = await this.authService.confirmPassword(
      newPassword,
      recoveryCode
    );

    if (!isConfirmed) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async login(
    req: RequestWithBody<LoginInputModel>,
    res: Response<LoginSuccessViewModel>
  ) {
    const user = req.user;

    const sessionResult = await this.sessionService.connectSession({
      ip: req.ip,
      deviceTitle: req.get('user-agent'),
      userId: user!.id,
    });

    if (!sessionResult) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    const { accessToken, refreshToken } = sessionResult;

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(HttpStatusCode.Success).json({ accessToken });
  }

  async refreshToken(req: Request, res: Response<LoginSuccessViewModel>) {
    await this.expiredTokenService.createExpiredToken(req.cookies.refreshToken);

    const JWTInfo = req.JWTInfo;

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtAdapter.createJWT({ userId: JWTInfo!.userId }, '10m'),
      this.jwtAdapter.createJWT(
        { userId: JWTInfo!.userId, deviceId: JWTInfo!.deviceId },
        '20m'
      ),
    ]);

    if (!accessToken || !refreshToken) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    const isRefreshed = await this.sessionService.refreshSession(refreshToken);

    if (!isRefreshed) {
      res.sendStatus(HttpStatusCode.Unauthorized);
      return;
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    res.status(HttpStatusCode.Success).json({ accessToken });
  }

  async authMe(req: Request, res: Response<MeViewModel>) {
    const user = req.user;

    const me: MeViewModel = {
      email: user!.email,
      login: user!.login,
      userId: user!.id,
    };

    res.status(HttpStatusCode.Success).json(me);
  }

  async logout(req: Request, res: Response) {
    await this.expiredTokenService.createExpiredToken(req.cookies.refreshToken);

    const JWTInfo = req.JWTInfo;

    const isDeleted = await this.sessionService.terminateSession(
      JWTInfo!.userId,
      JWTInfo!.deviceId
    );

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
