import { OptionalId } from 'mongodb';
import { ApiAccessModel } from '../models';
import { ApiAccessDBModel } from '../types';

// Data access layer
// 1. Взаимодействие с данными в базе.
// 2. Таким слоем может быть сторонняя апишка (напр., VideoAPI).
// 3. Репозиторий, обслуживающий бизнес-слой, не должен обслуживать query-запросы
// для этого есть QueryRepository.
// 4. Дублирование логики в обычном репозитории и query-репозитории - это нормально.
// Они отвечают за разные операции.
export class ApiAccessRepository {
  async createApiAccess({
    ip,
    url,
    date,
  }: OptionalId<ApiAccessDBModel>): Promise<string> {
    const apiAccess = new ApiAccessModel({ ip, url, date });
    await apiAccess.save();

    return apiAccess.id;
  }
}
