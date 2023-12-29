import { ObjectId, OptionalId } from 'mongodb';
import { NotConfirmedAccountModel } from '../models';
import { NotConfirmedAccountDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class NotConfirmedAccountRepository {
  async createNotConfirmedAccount(
    data: OptionalId<NotConfirmedAccountDBModel>
  ): Promise<string> {
    const notConfirmedAccount = new NotConfirmedAccountModel(data);
    await notConfirmedAccount.save();

    return notConfirmedAccount.id;
  }

  async updateNotConfirmedAccount({
    email,
    confirmationCode,
    expiryDate,
  }: {
    email: string;
    confirmationCode: string;
    expiryDate: Date;
  }): Promise<boolean> {
    const result = await NotConfirmedAccountModel.updateOne(
      { email },
      {
        $set: {
          confirmationCode,
          expiryDate,
        },
      }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deleteNotConfirmedAccountById(_id: ObjectId): Promise<boolean> {
    const result = await NotConfirmedAccountModel.deleteOne({ _id });

    return result.acknowledged && !!result.deletedCount;
  }
}
