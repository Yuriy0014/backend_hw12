import { ObjectId, OptionalId } from 'mongodb';
import { NotRecoveredPasswordModel } from '../models';
import { NotRecoveredPasswordDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class NotRecoveredPasswordRepository {
  async createNotRecoveredPassword(
    data: OptionalId<NotRecoveredPasswordDBModel>
  ): Promise<string> {
    const notRecoveredPassword = new NotRecoveredPasswordModel(data);
    await notRecoveredPassword.save();

    return notRecoveredPassword.id;
  }

  async updateNotRecoveredPassword({
    email,
    confirmationCode,
    expiryDate,
  }: {
    email: string;
    confirmationCode: string;
    expiryDate: Date;
  }): Promise<boolean> {
    const result = await NotRecoveredPasswordModel.updateOne(
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

  async deleteNotRecoveredPasswordById(_id: ObjectId): Promise<boolean> {
    const result = await NotRecoveredPasswordModel.deleteOne({ _id });

    return result.acknowledged && !!result.deletedCount;
  }
}
