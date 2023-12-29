import mongoose from 'mongoose';
import request from 'supertest';
import { jwtAdapter } from '../src/composition-root';
import { HttpStatusCode, RouterPaths } from '../src/constants';
import {
  superAdminLogin,
  superAdminPassword,
} from '../src/middlewares/superAdminAuthorization';
import { app } from '../src/settings';
import {
  BlogInputModel,
  BlogViewModel,
  CommentInputModel,
  CommentViewModel,
  ErrorResult,
  Paginator,
  PostInputModel,
  PostViewModel,
  UserInputModel,
} from '../src/types';

const { posts, testing, blogs, users, comments } = RouterPaths;
const mongoURI =
  process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/blog_platform';

describe(posts, () => {
  const superAdminToken = Buffer.from(
    `${superAdminLogin}:${superAdminPassword}`
  ).toString('base64');
  const superAdminAuth = `Basic ${superAdminToken}`;

  let userToken = '';
  let userAuth = '';

  const wrongBlogId = '161514131211109876543210';
  const wrongPostId = '123456789101112131415161';

  let newBlog: BlogViewModel | null = null;
  let newPost: PostViewModel | null = null;
  let newComment: CommentViewModel | null = null;
  const emptyGetAllResponse: Paginator<PostViewModel> = {
    totalCount: 0,
    pagesCount: 0,
    page: 1,
    pageSize: 10,
    items: [],
  };

  beforeAll(async () => {
    await mongoose.connect(mongoURI);
    await request(app).delete(testing);

    const blogData: BlogInputModel = {
      name: 'new blog name',
      description: 'new blog description',
      websiteUrl: 'https://newWebsiteUrl.com',
    };

    const blogCreateRes = await request(app)
      .post(blogs)
      .set({ Authorization: superAdminAuth })
      .send(blogData)
      .expect(HttpStatusCode.Created);

    newBlog = blogCreateRes.body;

    const userData: UserInputModel = {
      login: 'User_1',
      password: '1234567',
      email: 'newuser@example.com',
    };

    const userCreateRes = await request(app)
      .post(users)
      .set({ Authorization: superAdminAuth })
      .send(userData)
      .expect(HttpStatusCode.Created);

    userToken = await jwtAdapter.createJWT(
      { userId: userCreateRes.body.id },
      '10s'
    );
    userAuth = `Bearer ${userToken}`;
  });

  afterAll(async () => {
    await request(app).delete(testing);
    await mongoose.disconnect();
  });

  it('GET posts = []', async () => {
    await request(app)
      .get(posts)
      .expect(HttpStatusCode.Success, emptyGetAllResponse);
  });

  it('- POST does not create post with incorrect login and password', async () => {
    const inputData: PostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: wrongBlogId,
    };

    await request(app)
      .post(posts)
      .send(inputData)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(posts);
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('- POST does not create post with incorrect data', async () => {
    const inputData: PostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: wrongBlogId,
    };

    const errorResult: ErrorResult = {
      errorsMessages: [
        { field: 'title', message: 'Invalid title.' },
        {
          field: 'shortDescription',
          message: 'Invalid shortDescription.',
        },
        {
          field: 'content',
          message: 'Invalid content.',
        },
        {
          field: 'blogId',
          message: 'Invalid blogId.',
        },
      ],
    };

    await request(app)
      .post(posts)
      .set({ Authorization: superAdminAuth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request, errorResult);

    const res = await request(app).get(posts);
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('+ POST creates post with correct data', async () => {
    const inputData: PostInputModel = {
      title: 'next post title',
      shortDescription: 'next post shortDescription',
      content: 'next post content',
      blogId: `${newBlog?.id}`,
    };

    const createRes = await request(app)
      .post(posts)
      .set({ Authorization: superAdminAuth })
      .send(inputData)
      .expect(HttpStatusCode.Created);

    newPost = createRes.body;

    const getRes = await request(app).get(posts);

    const foundPost = getRes.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );

    expect(foundPost).toEqual(newPost);
  });

  it('- GET post by ID with incorrect id', async () => {
    await request(app)
      .get(`${posts}/${wrongPostId}`)
      .expect(HttpStatusCode.Not_Found);
  });

  it('+ GET post by ID with correct id', async () => {
    await request(app)
      .get(`${posts}/${newPost?.id}`)
      .expect(HttpStatusCode.Success, newPost);
  });

  it('- POST does not create comment for specific post with incorrect login and password', async () => {
    await request(app)
      .post(`${posts}/${newPost?.id}/comments`)
      .send()
      .expect(HttpStatusCode.Unauthorized);

    const getRes = await request(app).get(comments);

    expect(getRes.body.totalCount).toEqual(0);
  });

  it('- POST does not create comment for specific post with incorrect post ID', async () => {
    const inputData: CommentInputModel = {
      content: 'qwerty qwerty qwerty qwerty qwerty',
    };

    await request(app)
      .post(`${posts}/${wrongPostId}/comments`)
      .set({ Authorization: userAuth })
      .send(inputData)
      .expect(HttpStatusCode.Not_Found);

    const getRes = await request(app).get(comments);

    expect(getRes.body.totalCount).toEqual(0);
  });

  it('- POST does not create comment for specific post with incorrect data', async () => {
    const inputData: CommentInputModel = {
      content: 'qw',
    };

    await request(app)
      .post(`${posts}/${newPost?.id}/comments`)
      .set({ Authorization: userAuth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request);

    const getRes = await request(app).get(comments);

    expect(getRes.body.totalCount).toEqual(0);
  });

  it('+ POST creates comment for specific post with correct data', async () => {
    const inputData: CommentInputModel = {
      content: 'qwerty qwerty qwerty qwerty qwerty',
    };

    const createRes = await request(app)
      .post(`${posts}/${newPost?.id}/comments`)
      .set({ Authorization: userAuth })
      .send(inputData)
      .expect(HttpStatusCode.Created);

    newComment = createRes.body;

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- GET does not get comments for specific post with incorrect ID', async () => {
    await request(app)
      .get(`${posts}/${wrongPostId}/comments`)
      .expect(HttpStatusCode.Not_Found);
  });

  it('+ GET comments for specific post with correct ID', async () => {
    await request(app)
      .get(`${posts}/${newPost?.id}/comments`)
      .expect(HttpStatusCode.Success);
  });

  it('- PUT does not update post by ID with incorrect login and password', async () => {
    const inputData: PostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: '',
    };

    await request(app)
      .put(`${posts}/${newPost?.id}`)
      .send(inputData)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(posts);
    const foundPost = res.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );
    expect(foundPost).toEqual(newPost);
  });

  it('- PUT does not update post by ID with incorrect data', async () => {
    const inputData: PostInputModel = {
      title: '',
      shortDescription: '',
      content: '',
      blogId: wrongBlogId,
    };

    const errorResult: ErrorResult = {
      errorsMessages: [
        { field: 'title', message: 'Invalid title.' },
        {
          field: 'shortDescription',
          message: 'Invalid shortDescription.',
        },
        {
          field: 'content',
          message: 'Invalid content.',
        },
        {
          field: 'blogId',
          message: 'Invalid blogId.',
        },
      ],
    };

    await request(app)
      .put(`${posts}/${newPost?.id}`)
      .set({ Authorization: superAdminAuth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request, errorResult);

    const res = await request(app).get(posts);
    const foundPost = res.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );
    expect(foundPost).toEqual(newPost);
  });

  it('+ PUT updates post by ID with correct data', async () => {
    const updatedData: PostInputModel = {
      title: 'updated post title',
      shortDescription: 'updated post shortDescription',
      content: 'updated post content',
      blogId: `${newBlog?.id}`,
    };

    await request(app)
      .put(`${posts}/${newPost?.id}`)
      .set({ Authorization: superAdminAuth })
      .send(updatedData)
      .expect(HttpStatusCode.No_Content);

    const res = await request(app).get(posts);
    const foundPost = res.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );
    expect(foundPost).toEqual({ ...newPost, ...updatedData });

    newPost = foundPost;
  });

  it('- DELETE does not delete post by ID with incorrect login and password', async () => {
    await request(app)
      .delete(`${posts}/${wrongPostId}`)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(posts);
    const foundPost = res.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );
    expect(foundPost).toEqual(newPost);
  });

  it('- DELETE does not delete post by ID with incorrect id', async () => {
    await request(app)
      .delete(`${posts}/${wrongPostId}`)
      .set({ Authorization: superAdminAuth })
      .expect(HttpStatusCode.Not_Found);

    const res = await request(app).get(posts);
    const foundPost = res.body.items.find(
      (post: PostViewModel) => post.id === newPost?.id
    );
    expect(foundPost).toEqual(newPost);
  });

  it('+ DELETE post by ID with correct id', async () => {
    await request(app)
      .delete(`${posts}/${newPost?.id}`)
      .set({ Authorization: superAdminAuth })
      .expect(HttpStatusCode.No_Content);

    await request(app)
      .get(`${posts}/${newPost?.id}`)
      .expect(HttpStatusCode.Not_Found);
  });
});
