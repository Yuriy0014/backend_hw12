import { JWTAdapter, NodemailerAdapter } from './adapters';
import {
  AuthController,
  BlogController,
  CommentController,
  LikeController,
  PostController,
  SessionController,
  UserController,
} from './controllers';
import { EmailManager } from './managers';
import {
  ApiAccessQueryRepository,
  BlogQueryRepository,
  CommentQueryRepository,
  ExpiredTokenQueryRepository,
  LikeQueryRepository,
  NotConfirmedAccountQueryRepository,
  NotRecoveredPasswordQueryRepository,
  PostQueryRepository,
  SessionQueryRepository,
  UserQueryRepository,
} from './query-repositories';
import {
  ApiAccessRepository,
  BlogRepository,
  CommentRepository,
  ExpiredTokenRepository,
  LikeRepository,
  NotConfirmedAccountRepository,
  NotRecoveredPasswordRepository,
  PostRepository,
  SessionRepository,
  UserRepository,
} from './repositories';
import {
  ApiAccessService,
  AuthService,
  BlogService,
  CommentService,
  ExpiredTokenService,
  PostService,
  SessionService,
  UserService,
} from './services';
import { LikeService } from './services/like.service';

// Query Repositories
export const blogQueryRepository = new BlogQueryRepository();
export const postQueryRepository = new PostQueryRepository();
export const commentQueryRepository = new CommentQueryRepository();
export const userQueryRepository = new UserQueryRepository();
export const likeQueryRepository = new LikeQueryRepository();
export const notConfirmedAccountQueryRepository =
  new NotConfirmedAccountQueryRepository();
export const notRecoveredPasswordQueryRepository =
  new NotRecoveredPasswordQueryRepository();
export const sessionQueryRepository = new SessionQueryRepository();
export const expiredTokenQueryRepository = new ExpiredTokenQueryRepository();
export const apiAccessQueryRepository = new ApiAccessQueryRepository();

// Repositories
const blogRepository = new BlogRepository();
const postRepository = new PostRepository();
const commentRepository = new CommentRepository();
const userRepository = new UserRepository();
const likeRepository = new LikeRepository();
const notConfirmedAccountRepository = new NotConfirmedAccountRepository();
const notRecoveredPasswordRepository = new NotRecoveredPasswordRepository();
const sessionRepository = new SessionRepository();
const expiredTokenRepository = new ExpiredTokenRepository();
const apiAccessRepository = new ApiAccessRepository();

// Adapters
export const jwtAdapter = new JWTAdapter();
const nodeMailerAdapter = new NodemailerAdapter();

// Managers
const emailManager = new EmailManager(nodeMailerAdapter);

// Services
const blogService = new BlogService({ blogRepository });
const postService = new PostService({
  postRepository,
  blogQueryRepository,
});
const commentService = new CommentService({
  commentRepository,
});
const userService = new UserService({ userRepository });
const authService = new AuthService({
  userRepository,
  notConfirmedAccountQueryRepository,
  notConfirmedAccountRepository,
  notRecoveredPasswordQueryRepository,
  notRecoveredPasswordRepository,
  emailManager,
});
export const likeService = new LikeService({
  likeRepository,
  likeQueryRepository,
});
const sessionService = new SessionService({
  sessionQueryRepository,
  sessionRepository,
  jwtAdapter,
});
export const expiredTokenService = new ExpiredTokenService({
  expiredTokenRepository,
});
export const apiAccessService = new ApiAccessService({ apiAccessRepository });

// Controllers
export const blogController = new BlogController({
  blogQueryRepository,
  blogService,
  postQueryRepository,
  postService,
  likeService,
});

export const postController = new PostController({
  postQueryRepository,
  postService,
  commentQueryRepository,
  likeService,
});

export const commentController = new CommentController({
  commentQueryRepository,
  commentService,
  likeService,
});

export const userController = new UserController({
  userQueryRepository,
  userService,
});

export const authController = new AuthController({
  authService,
  sessionService,
  expiredTokenService,
  userQueryRepository,
  notConfirmedAccountQueryRepository,
  notRecoveredPasswordQueryRepository,
  emailManager,
  jwtAdapter,
});

export const sessionController = new SessionController({
  sessionQueryRepository,
  sessionService,
  expiredTokenService,
});

export const likeController = new LikeController({
  likeQueryRepository,
  likeService,
  commentQueryRepository,
  postQueryRepository,
});
