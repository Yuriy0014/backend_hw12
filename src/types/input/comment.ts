import { SortDirection } from 'mongodb';
import { LikeStatus } from '../../constants';
import { CommentViewModel } from '../view/comment';

export type CommentInputModel = {
  content: string;
};

export type CommentQueryParams = {
  sortBy?: keyof CommentViewModel | null;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};
