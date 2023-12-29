import { WithId } from 'mongodb';
import { LikeStatus } from './constants';
import {
  CommentDBModel,
  CommentViewModel,
  DeviceViewModel,
  EntitiesLikesInfo,
  LikesInfo,
  PostDBModel,
  PostViewModel,
  SessionDBModel,
  UserDBModel,
  UserViewModel,
} from './types';

export const mapToViewModel = <I>({
  _id,
  ...rest
}: WithId<I>): Omit<WithId<I>, '_id'> & { id: string } => ({
  ...rest,
  id: _id.toString(),
});

export const mapUserToViewModel = (
  user: WithId<UserDBModel>
): UserViewModel => ({
  id: user._id.toString(),
  login: user.accountData.login,
  email: user.email,
  createdAt: user.accountData.createdAt,
});

export const mapSessionToViewModel = (
  session: WithId<SessionDBModel>
): DeviceViewModel => ({
  ip: session.ip,
  deviceId: session.deviceId,
  lastActiveDate: session.issueDate,
  title: session.deviceTitle,
});

type CommentToViewModelArgs = Omit<LikesInfo, 'myStatus'> & {
  myStatus: LikeStatus | null;
};

export const mapCommentToViewModel =
  (commentsLikesInfo: EntitiesLikesInfo) =>
  (comment: WithId<CommentDBModel>): CommentViewModel => ({
    id: comment._id.toString(),
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    content: comment.content,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: commentsLikesInfo.likes[comment._id.toString()] || 0,
      dislikesCount: commentsLikesInfo.dislikes[comment._id.toString()] || 0,
      myStatus:
        commentsLikesInfo.userLikeStatus[comment._id.toString()] ||
        LikeStatus.None,
    },
  });

export const mapPostToViewModel =
  (postsLikesInfo: EntitiesLikesInfo) =>
  (post: WithId<PostDBModel>): PostViewModel => ({
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: postsLikesInfo.likes[post._id.toString()] || 0,
      dislikesCount: postsLikesInfo.dislikes[post._id.toString()] || 0,
      myStatus:
        postsLikesInfo.userLikeStatus[post._id.toString()] || LikeStatus.None,
      newestLikes: postsLikesInfo.newestLikes?.[post._id.toString()] || [],
    },
  });
