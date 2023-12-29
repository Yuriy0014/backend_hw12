import { SortDirection } from '..';
import { UserViewModel } from '../view/user';

export type UserInputModel = {
  login: string;
  password: string;
  email: string;
};

export type UserQueryParams = {
  searchLoginTerm?: string | null;
  searchEmailTerm?: string | null;
  sortBy?: keyof UserViewModel | null;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};
