import { CommentatorInfo } from '../../types';

export type CommentDBModel = {
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  postId: string;
};
