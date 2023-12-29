import { Response } from 'express';
import { HttpStatusCode, LikeableEntity } from '../constants';
import {
  CommentQueryRepository,
  LikeQueryRepository,
  PostQueryRepository,
} from '../query-repositories';
import { LikeService } from '../services/like.service';
import { LikeInputModel, RequestWithParamsAndBody } from '../types';

type LikePostParams = {
  postId: string;
};

type LikeCommentParams = {
  commentId: string;
};

type LikeControllerArgs = {
  likeQueryRepository: LikeQueryRepository;
  likeService: LikeService;
  commentQueryRepository: CommentQueryRepository;
  postQueryRepository: PostQueryRepository;
};

export class LikeController {
  protected likeQueryRepository;
  protected likeService;
  protected commentQueryRepository;
  protected postQueryRepository;
  constructor({
    likeQueryRepository,
    likeService,
    commentQueryRepository,
    postQueryRepository,
  }: LikeControllerArgs) {
    this.likeQueryRepository = likeQueryRepository;
    this.likeService = likeService;
    this.commentQueryRepository = commentQueryRepository;
    this.postQueryRepository = postQueryRepository;
  }

  async getUserLikedPosts(
    req: RequestWithParamsAndBody<{ userId: string }, LikeInputModel>,
    res: Response
  ) {
    const likeStatus = req.body.likeStatus;
    const userId = req.params.userId;

    const likes = await this.likeQueryRepository.getLikes({
      userId,
      likeStatus,
      entityType: LikeableEntity.Post,
    });

    res.status(HttpStatusCode.Success).json(likes);
  }

  async updateCommentLikeStatus(
    req: RequestWithParamsAndBody<LikeCommentParams, LikeInputModel>,
    res: Response
  ) {
    const commentId = req.params.commentId;
    const likeStatus = req.body.likeStatus;
    const userId = req.user!.id;
    const login = req.user!.login;

    const comment = await this.commentQueryRepository.getCommentById(commentId);

    if (!comment) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const isUpdated = await this.likeService.updateLikeEntity({
      entityId: commentId,
      entityType: LikeableEntity.Comment,
      userId,
      likeStatus,
      login,
    });

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async updatePostLikeStatus(
    req: RequestWithParamsAndBody<LikePostParams, LikeInputModel>,
    res: Response
  ) {
    const postId = req.params.postId;
    const likeStatus = req.body.likeStatus;
    const userId = req.user!.id;
    const login = req.user!.login;

    const post = await this.postQueryRepository.getPostById(postId);

    if (!post) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const isUpdated = await this.likeService.updateLikeEntity({
      entityId: postId,
      entityType: LikeableEntity.Post,
      userId,
      likeStatus,
      login,
    });

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
