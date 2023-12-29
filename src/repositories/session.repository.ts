import { OptionalId } from 'mongodb';
import { SessionModel } from '../models';
import { SessionDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class SessionRepository {
  async createSession(data: OptionalId<SessionDBModel>): Promise<string> {
    const session = new SessionModel(data);
    await session.save();

    return session.id;
  }

  async updateSession(
    userId: string,
    deviceId: string,
    data: { issueDate: string; expiryDate: string }
  ): Promise<boolean> {
    const result = await SessionModel.updateOne(
      { userId, deviceId },
      { $set: data }
    );

    return result.acknowledged && !!result.modifiedCount;
  }

  async deleteSession(userId: string, deviceId: string): Promise<boolean> {
    const result = await SessionModel.deleteOne({ userId, deviceId });

    return result.acknowledged && !!result.deletedCount;
  }

  async deleteAllOtherSessions(
    userId: string,
    deviceId: string
  ): Promise<boolean> {
    const result = await SessionModel.deleteMany({
      userId,
      deviceId: { $ne: deviceId },
    });

    return result.acknowledged && !!result.deletedCount;
  }
}
