import { Response } from 'express';
import { HttpStatusCode, LikeableEntity } from '../constants';
import {
  CommentQueryRepository,
  PostQueryRepository,
} from '../query-repositories';
import { PostService } from '../services';
import { LikeService } from '../services/like.service';
import {
  CommentInputModel,
  CommentQueryParams,
  CommentViewModel,
  Paginator,
  PostInputModel,
  PostQueryParams,
  PostViewModel,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
} from '../types';
import { mapCommentToViewModel, mapPostToViewModel } from '../utils';

type PostParams = {
  id: string;
};

type PostControllerArgs = {
  postQueryRepository: PostQueryRepository;
  postService: PostService;
  commentQueryRepository: CommentQueryRepository;
  likeService: LikeService;
};

export class PostController {
  protected postQueryRepository;
  protected postService;
  protected commentQueryRepository;
  protected likeService;

  constructor({
    postQueryRepository,
    postService,
    commentQueryRepository,
    likeService,
  }: PostControllerArgs) {
    this.postQueryRepository = postQueryRepository;
    this.postService = postService;
    this.commentQueryRepository = commentQueryRepository;
    this.likeService = likeService;
  }

  async getPosts(
    req: RequestWithQuery<PostQueryParams>,
    res: Response<Paginator<PostViewModel>>
  ) {
    const userId = req.user?.id || null;

    const [posts, postsLikesInfo] = await Promise.all([
      this.postQueryRepository.getAllPosts(req.query),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Post,
        isExtended: true,
      }),
    ]);

    res.status(HttpStatusCode.Success).json({
      page: posts.page,
      pagesCount: posts.pagesCount,
      pageSize: posts.pageSize,
      totalCount: posts.totalCount,
      items: posts.items.map(mapPostToViewModel(postsLikesInfo)),
    });
  }

  async getPost(
    req: RequestWithParams<PostParams>,
    res: Response<PostViewModel>
  ) {
    const userId = req.user?.id || null;

    const post = await this.postQueryRepository.getPostById(req.params.id);

    if (!post) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const postsLikesInfo = await this.likeService.createEntitiesLikesInfo({
      userId,
      entityType: LikeableEntity.Post,
      isExtended: true,
    });

    res
      .status(HttpStatusCode.Success)
      .json(mapPostToViewModel(postsLikesInfo)(post));
  }

  async createPost(
    req: RequestWithBody<PostInputModel>,
    res: Response<PostViewModel | null>
  ) {
    const userId = req.user?.id || null;

    const [postId, postsLikesInfo] = await Promise.all([
      this.postService.createPost(req.body),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Post,
        isExtended: true,
      }),
    ]);

    if (!postId) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    const post = await this.postQueryRepository.getPostById(postId);

    if (!post) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    res
      .status(HttpStatusCode.Created)
      .json(mapPostToViewModel(postsLikesInfo)(post));
  }

  async updatePost(
    req: RequestWithParamsAndBody<PostParams, PostInputModel>,
    res: Response
  ) {
    const isUpdated = await this.postService.updatePostById(
      req.params.id,
      req.body
    );

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async deletePost(req: RequestWithParams<PostParams>, res: Response) {
    const isDeleted = await this.postService.deletePostById(req.params.id);

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async getPostComments(
    req: RequestWithParamsAndQuery<PostParams, CommentQueryParams>,
    res: Response<Paginator<CommentViewModel>>
  ) {
    const userId = req.user?.id || null;

    const [post, commentsLikesInfo] = await Promise.all([
      this.postQueryRepository.getPostById(req.params.id),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Comment,
      }),
    ]);

    if (!post) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const comments = await this.postQueryRepository.getCommentsByPostId(
      req.params.id,
      req.query
    );

    res.status(HttpStatusCode.Success).json({
      page: comments.page,
      pagesCount: comments.pagesCount,
      pageSize: comments.pageSize,
      totalCount: comments.totalCount,
      items: comments.items.map(mapCommentToViewModel(commentsLikesInfo)),
    });
  }

  async createComment(
    req: RequestWithParamsAndBody<PostParams, CommentInputModel>,
    res: Response<CommentViewModel>
  ) {
    const userId = req.user!.id;

    const post = await this.postQueryRepository.getPostById(req.params.id);

    if (!post) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const commentId = await this.postService.createComment(
      req.params.id,
      req.body,
      {
        userId,
        userLogin: req.user!.login,
      }
    );

    if (!commentId) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    const [comment, commentsLikesInfo] = await Promise.all([
      this.commentQueryRepository.getCommentById(commentId),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Comment,
      }),
    ]);

    if (!comment) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    res
      .status(HttpStatusCode.Created)
      .json(mapCommentToViewModel(commentsLikesInfo)(comment));
  }
}
