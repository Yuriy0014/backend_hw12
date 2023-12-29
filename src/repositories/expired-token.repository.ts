import { OptionalId } from 'mongodb';
import { ExpiredTokenModel } from '../models';
import { ExpiredTokenDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class ExpiredTokenRepository {
  async createExpiredToken({
    token,
  }: OptionalId<ExpiredTokenDBModel>): Promise<string> {
    const expiredToken = new ExpiredTokenModel({ token });
    await expiredToken.save();

    return expiredToken.id;
  }
}
