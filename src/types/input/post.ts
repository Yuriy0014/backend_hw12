import { SortDirection } from '..';
import { PostViewModel } from '../view/post';

export type PostInputModel = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostQueryParams = {
  sortBy?: keyof PostViewModel;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};
