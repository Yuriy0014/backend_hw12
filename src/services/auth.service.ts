import bcrypt from 'bcrypt';
import { add } from 'date-fns';
import { OptionalId } from 'mongodb';
import { v4 } from 'uuid';
import { EmailManager } from '../managers';
import {
  NotConfirmedAccountQueryRepository,
  NotRecoveredPasswordQueryRepository,
} from '../query-repositories';
import {
  NotConfirmedAccountRepository,
  NotRecoveredPasswordRepository,
  UserRepository,
} from '../repositories';
import {
  NotConfirmedAccountDBModel,
  UserDBModel,
  UserInputModel,
} from '../types';

type AuthServiceArgs = {
  userRepository: UserRepository;
  notConfirmedAccountQueryRepository: NotConfirmedAccountQueryRepository;
  notConfirmedAccountRepository: NotConfirmedAccountRepository;
  notRecoveredPasswordQueryRepository: NotRecoveredPasswordQueryRepository;
  notRecoveredPasswordRepository: NotRecoveredPasswordRepository;
  emailManager: EmailManager;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class AuthService {
  protected userRepository;
  protected notConfirmedAccountQueryRepository;
  protected notConfirmedAccountRepository;
  protected notRecoveredPasswordQueryRepository;
  protected notRecoveredPasswordRepository;
  protected emailManager;
  constructor({
    userRepository,
    notConfirmedAccountQueryRepository,
    notConfirmedAccountRepository,
    notRecoveredPasswordQueryRepository,
    notRecoveredPasswordRepository,
    emailManager,
  }: AuthServiceArgs) {
    this.notConfirmedAccountQueryRepository =
      notConfirmedAccountQueryRepository;
    this.notConfirmedAccountRepository = notConfirmedAccountRepository;
    this.notRecoveredPasswordQueryRepository =
      notRecoveredPasswordQueryRepository;
    this.notRecoveredPasswordRepository = notRecoveredPasswordRepository;
    this.emailManager = emailManager;
    this.userRepository = userRepository;
  }

  async registerUser({
    login,
    email,
    password,
  }: UserInputModel): Promise<string | null> {
    const passwordHash = await bcrypt.hash(password, 10);
    const confirmationCode = v4();

    const newUserData: OptionalId<UserDBModel> = {
      email,
      accountData: {
        login,
        password: passwordHash,
        createdAt: new Date().toISOString(),
      },
    };

    const newNotConfirmedAccount: OptionalId<NotConfirmedAccountDBModel> = {
      email,
      confirmationCode,
      expiryDate: add(new Date(), { minutes: 5 }),
      isConfirmed: false,
    };

    const [userId, notConfirmedAccountId] = await Promise.all([
      this.userRepository.createUser(newUserData),
      this.notConfirmedAccountRepository.createNotConfirmedAccount(
        newNotConfirmedAccount
      ),
    ]);

    if (!userId || !notConfirmedAccountId) {
      return null;
    }

    await this.emailManager.sendRegistrationConfirmationMessage(
      email,
      confirmationCode
    );

    return userId;
  }

  async updateNotConfirmedAccount(email: string): Promise<boolean> {
    return this.notConfirmedAccountRepository.updateNotConfirmedAccount({
      email,
      confirmationCode: v4(),
      expiryDate: add(new Date(), { minutes: 5 }),
    });
  }

  async confirmAccount(code: string): Promise<boolean> {
    const notConfirmedAccount =
      await this.notConfirmedAccountQueryRepository.getNotConfirmedAccountByCode(
        code
      );

    if (!notConfirmedAccount) {
      return false;
    }

    return this.notConfirmedAccountRepository.deleteNotConfirmedAccountById(
      notConfirmedAccount._id
    );
  }

  async recoverPassword(email: string): Promise<string | null> {
    const confirmationCode = v4();

    const notRecoveredPasswordId =
      await this.notRecoveredPasswordRepository.createNotRecoveredPassword({
        email,
        confirmationCode,
        expiryDate: add(new Date(), { minutes: 5 }),
      });

    if (!notRecoveredPasswordId) {
      return null;
    }

    await this.emailManager.sendPasswordRecoveryMessage(
      email,
      confirmationCode
    );

    return notRecoveredPasswordId;
  }

  async updateNotRecoveredPassword(email: string): Promise<boolean> {
    return this.notRecoveredPasswordRepository.updateNotRecoveredPassword({
      email,
      confirmationCode: v4(),
      expiryDate: add(new Date(), { minutes: 5 }),
    });
  }

  async confirmPassword(newPassword: string, code: string): Promise<boolean> {
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const notRecoveredPassword =
      await this.notRecoveredPasswordQueryRepository.getNotRecoveredPasswordByCode(
        code
      );

    if (!notRecoveredPassword) {
      return false;
    }

    const isUpdated = await this.userRepository.updateUserPasswordByEmail(
      notRecoveredPassword.email,
      newPasswordHash
    );

    if (!isUpdated) {
      return false;
    }

    return this.notRecoveredPasswordRepository.deleteNotRecoveredPasswordById(
      notRecoveredPassword._id
    );
  }
}
