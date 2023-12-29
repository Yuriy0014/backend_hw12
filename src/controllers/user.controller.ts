import { Response } from 'express';
import { HttpStatusCode } from '../constants';
import { UserQueryRepository } from '../query-repositories';
import { UserService } from '../services';
import {
  Paginator,
  RequestWithBody,
  RequestWithParams,
  RequestWithQuery,
  UserInputModel,
  UserQueryParams,
} from '../types';
import { UserViewModel } from '../types/view/user';
import { mapUserToViewModel } from '../utils';

type UserParams = {
  id: string;
};

type UserControllerArgs = {
  userQueryRepository: UserQueryRepository;
  userService: UserService;
};

export class UserController {
  protected userQueryRepository;
  protected userService;
  constructor({ userQueryRepository, userService }: UserControllerArgs) {
    this.userQueryRepository = userQueryRepository;
    this.userService = userService;
  }

  async getUsers(
    req: RequestWithQuery<UserQueryParams>,
    res: Response<Paginator<UserViewModel>>
  ) {
    const users = await this.userQueryRepository.getAllUsers(req.query);

    res.status(HttpStatusCode.Success).json({
      page: users.page,
      pagesCount: users.pagesCount,
      pageSize: users.pageSize,
      totalCount: users.totalCount,
      items: users.items.map(mapUserToViewModel),
    });
  }

  async getUser(
    req: RequestWithParams<UserParams>,
    res: Response<UserViewModel>
  ) {
    const user = await this.userQueryRepository.getUserById(req.params.id);

    if (!user) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.status(HttpStatusCode.Success).json(mapUserToViewModel(user));
  }

  async createUser(
    req: RequestWithBody<UserInputModel>,
    res: Response<UserViewModel | null>
  ) {
    const userId = await this.userService.createUser(req.body);

    if (!userId) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    const user = await this.userQueryRepository.getUserById(userId);

    if (!user) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.status(HttpStatusCode.Created).json(mapUserToViewModel(user));
  }

  async deleteUser(req: RequestWithParams<UserParams>, res: Response) {
    const isDeleted = await this.userService.deleteUserById(req.params.id);

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
