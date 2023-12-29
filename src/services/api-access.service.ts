import { OptionalId } from 'mongodb';
import { ApiAccessRepository } from '../repositories';
import { ApiAccessDBModel } from '../types';

type ApiAccessServiceArgs = {
  apiAccessRepository: ApiAccessRepository;
};

// Business layer
// 1. Используется для мутирующих операций.
// 2. Конструирование правильных объектов, с бизнесовыми ограничениями и проверками
// (напр., при создании каждое видео должно быть заблокировано, пока проверку модерации не пройдёт,
// у каждого видео должен быть владелец и т.д.).
// 3. Хранит правила, которые должны быть соблюдены при CUD запросах.
export class ApiAccessService {
  protected apiAccessRepository;
  constructor({ apiAccessRepository }: ApiAccessServiceArgs) {
    this.apiAccessRepository = apiAccessRepository;
  }
  async createApiAccess({ ip, url, date }: ApiAccessDBModel): Promise<string> {
    const newApiAccessData: OptionalId<ApiAccessDBModel> = {
      ip,
      url,
      date,
    };

    return this.apiAccessRepository.createApiAccess(newApiAccessData);
  }
}
