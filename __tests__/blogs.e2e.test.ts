import mongoose from 'mongoose';
import request from 'supertest';
import { HttpStatusCode, RouterPaths } from '../src/constants';
import {
  superAdminLogin,
  superAdminPassword,
} from '../src/middlewares/superAdminAuthorization';
import { app } from '../src/settings';
import {
  BlogInputModel,
  BlogPostInputModel,
  BlogViewModel,
  ErrorResult,
  Paginator,
  PostViewModel,
} from '../src/types';

const { blogs, posts, testing } = RouterPaths;
const mongoURI =
  process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/blog_platform';

describe(blogs, () => {
  const token = Buffer.from(
    `${superAdminLogin}:${superAdminPassword}`
  ).toString('base64');
  const auth = `Basic ${token}`;
  const wrongBlogId = '161514131211109876543210';
  const wrongId = '123456789101112131415161';

  let newBlog: BlogViewModel | null = null;
  let newPost: PostViewModel | null = null;
  const emptyGetAllResponse: Paginator<BlogViewModel> = {
    totalCount: 0,
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    items: [],
  };

  beforeAll(async () => {
    await mongoose.connect(mongoURI);
    await request(app).delete(testing);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('GET blogs = []', async () => {
    await request(app)
      .get(blogs)
      .expect(HttpStatusCode.Success, emptyGetAllResponse);
  });

  it('- POST does not create blog with incorrect login and password', async () => {
    const inputData: BlogInputModel = {
      name: '',
      description: '',
      websiteUrl: '',
    };

    await request(app)
      .post(blogs)
      .send(inputData)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(blogs);
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('- POST does not create blog with incorrect data (no name, no description, no websiteUrl)', async () => {
    const inputData: BlogInputModel = {
      name: '',
      description: '',
      websiteUrl: '',
    };

    const errorResult: ErrorResult = {
      errorsMessages: [
        { field: 'name', message: 'Invalid name.' },
        {
          field: 'description',
          message: 'Invalid description.',
        },
        {
          field: 'websiteUrl',
          message: 'Invalid websiteUrl.',
        },
      ],
    };

    await request(app)
      .post(blogs)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request, errorResult);

    const res = await request(app).get(blogs);
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('+ POST creates blog with correct data', async () => {
    const inputData: BlogInputModel = {
      name: 'new blog name',
      description: 'new blog description',
      websiteUrl: 'https://newWebsiteUrl.com',
    };

    const createRes = await request(app)
      .post(blogs)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Created);

    newBlog = createRes.body;

    const getRes = await request(app).get(blogs);
    const foundBlog = getRes.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );

    expect(foundBlog).toEqual(newBlog);
  });

  it('- POST does not create post for specific blog with incorrect login and password', async () => {
    const inputData: BlogPostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
    };

    const createRes = await request(app)
      .post(`${blogs}/${wrongBlogId}/posts`)
      .send(inputData)
      .expect(HttpStatusCode.Unauthorized);

    newPost = createRes.body;

    const getRes = await request(app).get(posts);

    const foundPost = getRes.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );

    expect(foundPost).toEqual(undefined);
  });

  it('- POST does not create post for specific blog with incorrect data', async () => {
    const inputData: BlogPostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
    };

    const createRes = await request(app)
      .post(`${blogs}/${newBlog?.id}/posts`)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request);

    newPost = createRes.body;

    const getRes = await request(app).get(posts);

    const foundPost = getRes.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );

    expect(foundPost).toEqual(undefined);
  });

  it('- POST does not create post for specific blog with incorrect blogId', async () => {
    const inputData: BlogPostInputModel = {
      title: 'next post title',
      shortDescription: 'next post shortDescription',
      content: 'next post content',
    };

    const createRes = await request(app)
      .post(`${blogs}/${wrongBlogId}/posts`)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Not_Found);

    newPost = createRes.body;

    const getRes = await request(app).get(posts);

    const foundPost = getRes.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );

    expect(foundPost).toEqual(undefined);
  });

  it('+ POST creates post for specific blog with correct data', async () => {
    const inputData: BlogPostInputModel = {
      title: 'next post title',
      shortDescription: 'next post shortDescription',
      content: 'next post content',
    };

    const createRes = await request(app)
      .post(`${blogs}/${newBlog?.id}/posts`)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Created);

    newPost = createRes.body;

    const getRes = await request(app).get(posts);

    const foundPost = getRes.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );

    expect(foundPost).toEqual(newPost);
  });

  it('- GET blog by ID with incorrect id', async () => {
    await request(app)
      .get(`${blogs}/${wrongId}`)
      .expect(HttpStatusCode.Not_Found);
  });

  it('+ GET blog by ID with correct id', async () => {
    await request(app)
      .get(`${blogs}/${newBlog?.id}`)
      .expect(HttpStatusCode.Success, newBlog);
  });

  it('- GET does not get all posts for specific blog by ID with incorrect id', async () => {
    await request(app)
      .get(`${blogs}/${wrongBlogId}/posts`)
      .expect(HttpStatusCode.Not_Found);
  });

  it('+ GET all posts for specific blog by ID with correct id', async () => {
    const result = await request(app)
      .get(`${blogs}/${newBlog?.id}/posts`)
      .expect(HttpStatusCode.Success);

    const blogPostsPaginator: Paginator<PostViewModel> = result.body;

    const allPosts = await request(app).get(posts);

    const blogPostsCount = allPosts.body.items.filter(
      (post: PostViewModel) => post.blogId === newBlog?.id
    ).length;

    expect(blogPostsPaginator.items[0]).toEqual(newPost);
    expect(blogPostsPaginator.totalCount).toEqual(blogPostsCount);
  });

  it('- PUT does not update blog by ID with incorrect login and password', async () => {
    const inputData: BlogInputModel = {
      name: '',
      description: '',
      websiteUrl: '',
    };

    await request(app)
      .put(`${blogs}/${newBlog?.id}`)
      .send(inputData)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(blogs);
    const foundVideo = res.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );
    expect(foundVideo).toEqual(newBlog);
  });

  it('- PUT does not update blog by ID with incorrect data (no name, no description, no websiteUrl)', async () => {
    const inputData: BlogInputModel = {
      name: '',
      description: '',
      websiteUrl: '',
    };

    const errorResult: ErrorResult = {
      errorsMessages: [
        { field: 'name', message: 'Invalid name.' },
        {
          field: 'description',
          message: 'Invalid description.',
        },
        {
          field: 'websiteUrl',
          message: 'Invalid websiteUrl.',
        },
      ],
    };

    await request(app)
      .put(`${blogs}/${newBlog?.id}`)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request, errorResult);

    const res = await request(app).get(blogs);
    const foundVideo = res.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );
    expect(foundVideo).toEqual(newBlog);
  });

  it('+ PUT updates blog by ID with correct data', async () => {
    const updatedData: BlogInputModel = {
      name: 'upd blog name',
      description: 'updated blog description',
      websiteUrl: 'https://updatedWebsiteUrl.com',
    };

    await request(app)
      .put(`${blogs}/${newBlog?.id}`)
      .set({ Authorization: auth })
      .send(updatedData)
      .expect(HttpStatusCode.No_Content);

    const res = await request(app).get(blogs);
    const foundBlog = res.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );
    expect(foundBlog).toEqual({ ...newBlog, ...updatedData });

    newBlog = foundBlog;
  });

  it('- DELETE does not delete blog by ID with incorrect login and password', async () => {
    await request(app)
      .delete(`${blogs}/${newBlog?.id}`)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(blogs);
    const foundBlog = res.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );
    expect(foundBlog).toEqual(newBlog);
  });

  it('- DELETE does not delete blog by ID with incorrect id', async () => {
    await request(app)
      .delete(`${blogs}/${wrongId}`)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.Not_Found);

    const res = await request(app).get(blogs);
    const foundBlog = res.body.items.find(
      (blog: BlogViewModel) => blog.id === newBlog?.id
    );
    expect(foundBlog).toEqual(newBlog);
  });

  it('+ DELETE blog by ID with correct id', async () => {
    await request(app)
      .delete(`${blogs}/${newBlog?.id}`)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.No_Content);

    await request(app)
      .get(`${blogs}/${newBlog?.id}`)
      .expect(HttpStatusCode.Not_Found);
  });
});
