import bcrypt from 'bcrypt';
import { OptionalId } from 'mongodb';
import { UserRepository } from '../repositories';
import { UserDBModel, UserInputModel } from '../types';

type UserServiceArgs = {
  userRepository: UserRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class UserService {
  protected userRepository;
  constructor({ userRepository }: UserServiceArgs) {
    this.userRepository = userRepository;
  }
  async createUser({
    email,
    login,
    password,
  }: UserInputModel): Promise<string | null> {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUserData: OptionalId<UserDBModel> = {
      email,
      accountData: {
        login,
        password: passwordHash,
        createdAt: new Date().toISOString(),
      },
    };

    const userId = await this.userRepository.createUser(newUserData);

    if (!userId) {
      return null;
    }

    return userId;
  }

  async deleteUserById(id: string): Promise<boolean> {
    return this.userRepository.deleteUserById(id);
  }
}
