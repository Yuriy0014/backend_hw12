import { OptionalId } from 'mongodb';
import { ExpiredTokenRepository } from '../repositories';
import { ExpiredTokenDBModel } from '../types';

type ExpiredTokenServiceArgs = {
  expiredTokenRepository: ExpiredTokenRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class ExpiredTokenService {
  protected expiredTokenRepository;
  constructor({ expiredTokenRepository }: ExpiredTokenServiceArgs) {
    this.expiredTokenRepository = expiredTokenRepository;
  }
  async createExpiredToken(token: string): Promise<string> {
    const newTokenData: OptionalId<ExpiredTokenDBModel> = {
      token,
    };

    return this.expiredTokenRepository.createExpiredToken(newTokenData);
  }
}
