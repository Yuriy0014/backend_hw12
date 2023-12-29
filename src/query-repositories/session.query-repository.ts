import { WithId } from 'mongodb';
import { SessionModel } from '../models';
import { SessionDBModel } from '../types';

// Data access layer (query)
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Описывает модели и данные в том формате, в котором они нужны презентационному слою.
// 4. Работа с постраничным выводом, сортировками.
// 5. Возможен маппинг данных.
// 6. Для query-взаимодействия с внешними апишками можно создать отдельный бизнес-сервис под эту апишку
// (напр., VideoQueryService), который работает с несколькими DAL-слоями,
// либо создать запрос в самом QueryRepository.
// 7. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class SessionQueryRepository {
  async getSessionByDeviceTitle(
    userId: string,
    deviceTitle: string
  ): Promise<WithId<SessionDBModel> | null> {
    return SessionModel.findOne({ userId, deviceTitle }).lean();
  }

  async getAllSessionsForUser(
    userId: string
  ): Promise<Array<WithId<SessionDBModel>>> {
    return SessionModel.find({ userId }).lean();
  }

  async getSession(
    userId: string,
    deviceId: string
  ): Promise<WithId<SessionDBModel> | null> {
    return SessionModel.findOne({ userId, deviceId }).lean();
  }

  async getAllSessions(): Promise<Array<WithId<SessionDBModel>>> {
    return SessionModel.find().lean();
  }
}
