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
  PostInputModel,
  PostViewModel,
  UserInputModel,
} from '../src/types';

const { blogs, posts, testing, users, comments } = RouterPaths;
const mongoURI =
  process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/blog_platform';

describe(posts, () => {
  const superAdminToken = Buffer.from(
    `${superAdminLogin}:${superAdminPassword}`
  ).toString('base64');
  const superAdminAuth = `Basic ${superAdminToken}`;

  let userToken = '';
  let userAuth = '';

  let anotherUserToken = '';
  let anotherUserAuth = '';

  const wrongCommentId = '123456789101112131415161';

  let newBlog: BlogViewModel | null = null;
  let newPost: PostViewModel | null = null;
  let newComment: CommentViewModel | null = null;

  beforeAll(async () => {
    await mongoose.connect(mongoURI);
    await request(app).delete(testing);

    const blogData: BlogInputModel = {
      name: 'Blog 1',
      description: 'some description',
      websiteUrl: 'https://nextWebsiteUrl.com',
    };

    const blogCreateRes = await request(app)
      .post(blogs)
      .set({ Authorization: superAdminAuth })
      .send(blogData)
      .expect(HttpStatusCode.Created);

    newBlog = blogCreateRes.body;

    const postData: PostInputModel = {
      title: 'Post 1',
      shortDescription: 'string',
      content: 'string',
      blogId: newBlog!.id,
    };

    const postCreateRes = await request(app)
      .post(posts)
      .set({ Authorization: superAdminAuth })
      .send(postData)
      .expect(HttpStatusCode.Created);

    newPost = postCreateRes.body;

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

    const anotherUserData: UserInputModel = {
      login: 'User_2',
      password: '1234567',
      email: 'newuser@example.com',
    };

    const anotherUserCreateRes = await request(app)
      .post(users)
      .set({ Authorization: superAdminAuth })
      .send(anotherUserData)
      .expect(HttpStatusCode.Created);

    anotherUserToken = await jwtAdapter.createJWT(
      { userId: anotherUserCreateRes.body.id },
      '10s'
    );
    anotherUserAuth = `Bearer ${anotherUserToken}`;

    const commentData: CommentInputModel = {
      content: 'qwerty qwerty qwerty qwerty qwerty',
    };

    const commentCreateRes = await request(app)
      .post(`${posts}/${newPost?.id}/comments`)
      .set({ Authorization: userAuth })
      .send(commentData)
      .expect(HttpStatusCode.Created);

    newComment = commentCreateRes.body;
  });

  afterAll(async () => {
    await request(app).delete(testing);
    await mongoose.disconnect();
  });

  it('- GET does not get comment with incorrect ID', async () => {
    await request(app)
      .get(`${comments}/${wrongCommentId}`)
      .expect(HttpStatusCode.Not_Found);
  });

  it('+ GET comment with correct ID', async () => {
    await request(app)
      .get(`${comments}/${newComment?.id}`)
      .expect(HttpStatusCode.Success, newComment);
  });

  it('- PUT does not update comment with incorrect ID', async () => {
    const updatedData: CommentInputModel = {
      content: '123 123 123 123 123 123 123 123 123',
    };

    await request(app)
      .put(`${comments}/${wrongCommentId}`)
      .set({ Authorization: userAuth })
      .send(updatedData)
      .expect(HttpStatusCode.Not_Found);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- PUT does not update comment by ID with incorrect login and password', async () => {
    const updatedData: CommentInputModel = {
      content: '123 123 123 123 123 123 123 123 123',
    };

    await request(app)
      .put(`${comments}/${newComment?.id}`)
      .send(updatedData)
      .expect(HttpStatusCode.Unauthorized);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- PUT does not update comment by ID with incorrect user', async () => {
    const updatedData: CommentInputModel = {
      content: '123 123 123 123 123 123 123 123 123',
    };

    await request(app)
      .put(`${comments}/${newComment?.id}`)
      .set({ Authorization: anotherUserAuth })
      .send(updatedData)
      .expect(HttpStatusCode.Forbidden);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- PUT does not update comment by ID with incorrect data', async () => {
    const updatedData: CommentInputModel = {
      content: '12',
    };

    await request(app)
      .put(`${comments}/${newComment?.id}`)
      .set({ Authorization: userAuth })
      .send(updatedData)
      .expect(HttpStatusCode.Bad_Request);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('+ PUT updates comment by ID with correct data', async () => {
    const updatedData: CommentInputModel = {
      content: '123 123 123 123 123 123 123 123 123',
    };

    await request(app)
      .put(`${comments}/${newComment?.id}`)
      .set({ Authorization: userAuth })
      .send(updatedData)
      .expect(HttpStatusCode.No_Content);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual({ ...newComment, ...updatedData });

    newComment = foundComment;
  });

  it('- DELETE does not delete comment with incorrect ID', async () => {
    await request(app)
      .delete(`${comments}/${wrongCommentId}`)
      .set({ Authorization: userAuth })
      .expect(HttpStatusCode.Not_Found);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- DELETE does not delete comment with incorrect user', async () => {
    await request(app)
      .delete(`${comments}/${newComment?.id}`)
      .set({ Authorization: anotherUserAuth })
      .expect(HttpStatusCode.Forbidden);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('- DELETE does not delete comment with incorrect login and password', async () => {
    await request(app)
      .delete(`${comments}/${newComment?.id}`)
      .expect(HttpStatusCode.Unauthorized);

    const getRes = await request(app).get(comments);

    const foundComment = getRes.body.items.find(
      (comment: CommentViewModel) => comment.id === newComment?.id
    );

    expect(foundComment).toEqual(newComment);
  });

  it('+ DELETE comment with correct ID', async () => {
    await request(app)
      .delete(`${comments}/${newComment?.id}`)
      .set({ Authorization: userAuth })
      .expect(HttpStatusCode.No_Content);

    await request(app)
      .get(`${comments}/${newComment?.id}`)
      .expect(HttpStatusCode.Not_Found);
  });
});
