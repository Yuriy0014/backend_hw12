import { Response } from 'express';
import { HttpStatusCode, LikeableEntity } from '../constants';
import { CommentQueryRepository } from '../query-repositories';
import { CommentService } from '../services';
import { LikeService } from '../services/like.service';
import {
  CommentInputModel,
  CommentQueryParams,
  CommentViewModel,
  Paginator,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithQuery,
} from '../types';
import { mapCommentToViewModel } from '../utils';

type CommentParams = {
  id: string;
};

type CommentControllerArgs = {
  commentQueryRepository: CommentQueryRepository;
  commentService: CommentService;
  likeService: LikeService;
};

export class CommentController {
  protected commentQueryRepository;
  protected commentService;
  protected likeService;
  constructor({
    commentQueryRepository,
    commentService,
    likeService,
  }: CommentControllerArgs) {
    this.commentQueryRepository = commentQueryRepository;
    this.commentService = commentService;
    this.likeService = likeService;
  }

  async getComments(
    req: RequestWithQuery<CommentQueryParams>,
    res: Response<Paginator<CommentViewModel>>
  ) {
    const userId = req.user?.id || null;

    const [comments, commentsLikesInfo] = await Promise.all([
      this.commentQueryRepository.getAllComments(req.query),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Comment,
      }),
    ]);

    res.status(HttpStatusCode.Success).json({
      page: comments.page,
      pagesCount: comments.pagesCount,
      pageSize: comments.pageSize,
      totalCount: comments.totalCount,
      items: comments.items.map(mapCommentToViewModel(commentsLikesInfo)),
    });
  }

  async getComment(
    req: RequestWithParams<CommentParams>,
    res: Response<CommentViewModel>
  ) {
    const userId = req.user?.id || null;

    const [comment, commentsLikesInfo] = await Promise.all([
      this.commentQueryRepository.getCommentById(req.params.id),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Comment,
      }),
    ]);

    if (!comment) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res
      .status(HttpStatusCode.Success)
      .json(mapCommentToViewModel(commentsLikesInfo)(comment));
  }

  async updateComment(
    req: RequestWithParamsAndBody<CommentParams, CommentInputModel>,
    res: Response
  ) {
    const comment = await this.commentQueryRepository.getCommentById(
      req.params.id
    );

    if (!comment) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    if (req.user?.id !== comment.commentatorInfo.userId) {
      res.sendStatus(HttpStatusCode.Forbidden);
      return;
    }

    const isUpdated = await this.commentService.updateCommentById(
      req.params.id,
      req.body
    );

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async deleteComment(req: RequestWithParams<CommentParams>, res: Response) {
    const comment = await this.commentQueryRepository.getCommentById(
      req.params.id
    );

    if (!comment) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    if (req.user?.id !== comment.commentatorInfo.userId) {
      res.sendStatus(HttpStatusCode.Forbidden);
      return;
    }

    const isDeleted = await this.commentService.deleteCommentById(
      req.params.id
    );

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
