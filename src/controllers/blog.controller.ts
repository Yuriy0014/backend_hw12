import { Response } from 'express';
import { HttpStatusCode, LikeableEntity } from '../constants';
import {
  BlogQueryRepository,
  PostQueryRepository,
} from '../query-repositories';
import { BlogService, PostService } from '../services';
import { LikeService } from '../services/like.service';
import {
  BlogDBModel,
  BlogInputModel,
  BlogPostInputModel,
  BlogQueryParams,
  BlogViewModel,
  Paginator,
  PostQueryParams,
  PostViewModel,
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  RequestWithQuery,
} from '../types';
import { mapPostToViewModel, mapToViewModel } from '../utils';

type BlogParams = {
  id: string;
};

type BlogPostParams = {
  blogId: string;
};

type BlogControllerArgs = {
  blogQueryRepository: BlogQueryRepository;
  blogService: BlogService;
  postQueryRepository: PostQueryRepository;
  postService: PostService;
  likeService: LikeService;
};

export class BlogController {
  protected blogQueryRepository;
  protected blogService;
  protected postQueryRepository;
  protected postService;
  protected likeService;
  constructor({
    blogQueryRepository,
    blogService,
    postQueryRepository,
    postService,
    likeService,
  }: BlogControllerArgs) {
    this.blogQueryRepository = blogQueryRepository;
    this.blogService = blogService;
    this.postQueryRepository = postQueryRepository;
    this.postService = postService;
    this.likeService = likeService;
  }

  async getBlogs(
    req: RequestWithQuery<BlogQueryParams>,
    res: Response<Paginator<BlogViewModel>>
  ) {
    const blogs = await this.blogQueryRepository.getAllBlogs(req.query);

    res.status(HttpStatusCode.Success).json({
      page: blogs.page,
      pagesCount: blogs.pagesCount,
      pageSize: blogs.pageSize,
      totalCount: blogs.totalCount,
      items: blogs.items.map(mapToViewModel<BlogDBModel>),
    });
  }

  async getBlog(
    req: RequestWithParams<BlogParams>,
    res: Response<BlogViewModel>
  ) {
    const blog = await this.blogQueryRepository.getBlogById(req.params.id);

    if (!blog) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.status(HttpStatusCode.Success).json(mapToViewModel<BlogDBModel>(blog));
  }

  async getBlogPosts(
    req: RequestWithParamsAndQuery<BlogPostParams, PostQueryParams>,
    res: Response<Paginator<PostViewModel>>
  ) {
    const userId = req.user?.id || null;

    const blog = await this.blogQueryRepository.getBlogById(req.params.blogId);

    if (!blog) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const [blogPosts, postsLikesInfo] = await Promise.all([
      this.postQueryRepository.getPostsByBlogId(req.params.blogId, req.query),
      this.likeService.createEntitiesLikesInfo({
        userId,
        entityType: LikeableEntity.Post,
        isExtended: true,
      }),
    ]);

    res.status(HttpStatusCode.Success).json({
      page: blogPosts.page,
      pagesCount: blogPosts.pagesCount,
      pageSize: blogPosts.pageSize,
      totalCount: blogPosts.totalCount,
      items: blogPosts.items.map(mapPostToViewModel(postsLikesInfo)),
    });
  }

  async createBlog(
    req: RequestWithBody<BlogInputModel>,
    res: Response<BlogViewModel | null>
  ) {
    const blogId = await this.blogService.createBlog(req.body);
    const blog = await this.blogQueryRepository.getBlogById(blogId);

    if (!blog) {
      res.sendStatus(HttpStatusCode.Bad_Request);
      return;
    }

    res.status(HttpStatusCode.Created).json(mapToViewModel<BlogDBModel>(blog));
  }

  async createBlogPost(
    req: RequestWithParamsAndBody<BlogPostParams, BlogPostInputModel>,
    res: Response<PostViewModel | null>
  ) {
    const userId = req.user?.id || null;

    const blog = await this.blogQueryRepository.getBlogById(req.params.blogId);

    if (!blog) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    const postId = await this.postService.createPost({
      ...req.body,
      blogId: req.params.blogId,
    });

    if (!postId) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    const post = await this.postQueryRepository.getPostById(postId);

    if (!post) {
      res.status(HttpStatusCode.Bad_Request);
      return;
    }

    const postsLikesInfo = await this.likeService.createEntitiesLikesInfo({
      userId,
      entityType: LikeableEntity.Post,
      isExtended: true,
    });

    res
      .status(HttpStatusCode.Created)
      .json(mapPostToViewModel(postsLikesInfo)(post));
  }

  async updateBlog(
    req: RequestWithParamsAndBody<BlogParams, BlogInputModel>,
    res: Response
  ) {
    const isUpdated = await this.blogService.updateBlogById(
      req.params.id,
      req.body
    );

    if (!isUpdated) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }

  async deleteBlog(req: RequestWithParams<BlogParams>, res: Response) {
    const isDeleted = await this.blogService.deleteBlogById(req.params.id);

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.Not_Found);
      return;
    }

    res.sendStatus(HttpStatusCode.No_Content);
  }
}
