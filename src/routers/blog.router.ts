import { Router } from 'express';
import { blogController } from '../composition-root';
import { superAdminAuthorization } from '../middlewares';
import { blogPostValidator, blogValidator } from '../validators';

// Presentation layer
// 1. Коммуникация по http / graphQL / webSocket (запрос - ответ).
// 2. Отвечает за подготовку (маппинг) данных для пользователей (напр., фронтов, других бэкендов).
// 3. Парсит body, query, URI параметры.
// 4. При query запросе правильнее обращаться напрямую к Data access слою.
export const blogRouter = Router();

blogRouter.get('/', blogController.getBlogs.bind(blogController));

blogRouter.get('/:id', blogController.getBlog.bind(blogController));

blogRouter.get(
  '/:blogId/posts',
  blogController.getBlogPosts.bind(blogController)
);

blogRouter.post(
  '/',
  superAdminAuthorization,
  blogValidator(),
  blogController.createBlog.bind(blogController)
);

blogRouter.post(
  '/:blogId/posts',
  superAdminAuthorization,
  blogPostValidator(),
  blogController.createBlogPost.bind(blogController)
);

blogRouter.put(
  '/:id',
  superAdminAuthorization,
  blogValidator(),
  blogController.updateBlog.bind(blogController)
);

blogRouter.delete(
  '/:id',
  superAdminAuthorization,
  blogController.deleteBlog.bind(blogController)
);
