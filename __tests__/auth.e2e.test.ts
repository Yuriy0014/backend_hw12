import mongoose from 'mongoose';
import request from 'supertest';
import { jwtAdapter } from '../src/composition-root';
import { HttpStatusCode, RouterPaths } from '../src/constants';
import {
  superAdminLogin,
  superAdminPassword,
} from '../src/middlewares/superAdminAuthorization';
import { app } from '../src/settings';
import { MeViewModel, UserInputModel, UserViewModel } from '../src/types';

const { auth, users, testing } = RouterPaths;
const mongoURI =
  process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/blog_platform';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe(auth, () => {
  const superAdminToken = Buffer.from(
    `${superAdminLogin}:${superAdminPassword}`
  ).toString('base64');
  const superAdminAuth = `Basic ${superAdminToken}`;

  let userToken = '';
  let userAuth = '';
  let fakeAuth = '';

  const fakeUserId = '123456789101112131415161';
  const requestsCount = 5;
  const msLimit = 10000;

  let newUser: UserViewModel | null = null;

  beforeAll(async () => {
    await mongoose.connect(mongoURI);
    await request(app).delete(testing);

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

    const fakeToken = await jwtAdapter.createJWT({ userId: fakeUserId }, '10s');
    fakeAuth = `Bearer ${fakeToken}`;

    newUser = userCreateRes.body;
  });

  afterAll(async () => {
    await request(app).delete(testing);
    await mongoose.disconnect();
  });

  it('- POST try to register user too many times', async () => {
    let requests: Array<request.Test> = [];

    for (let i = 0; i < requestsCount; i++) {
      requests.push(
        request(app).post(`${auth}/registration`).send({
          login: `User 2`,
          password: '1234567',
          email: `newuser2@example.com`,
        })
      );
    }

    const results = await Promise.all(requests);

    results.forEach((result) =>
      expect(result.statusCode).toBe(HttpStatusCode.Bad_Request)
    );

    await request(app)
      .post(`${auth}/registration`)
      .send({
        login: 'User 2',
        password: '1234567',
        email: 'newuser@example.com',
      })
      .expect(HttpStatusCode.Too_Many_Requests);

    await delay(msLimit);

    await request(app)
      .post(`${auth}/registration`)
      .send({
        login: 'User 2',
        password: '1234567',
        email: 'newuser10@example.com',
      })
      .expect(HttpStatusCode.Bad_Request);
  });

  it('- POST does not login user with incorrect login', async () => {
    await request(app)
      .post(`${auth}/login`)
      .send({ loginOrEmail: 'User_2', password: '1234567' })
      .expect(HttpStatusCode.Unauthorized);
  });

  it('- POST does not login user with incorrect password', async () => {
    await request(app)
      .post(`${auth}/login`)
      .send({ loginOrEmail: 'User_1', password: '12345678' })
      .expect(HttpStatusCode.Unauthorized);
  });

  it('- POST try to login user too many times', async () => {
    await delay(msLimit);

    let requests: Array<request.Test> = [];

    for (let i = 0; i < requestsCount; i++) {
      requests.push(
        request(app)
          .post(`${auth}/login`)
          .send({ loginOrEmail: 'User_2', password: '12345678' })
      );
    }

    const results = await Promise.all(requests);

    results.forEach((result) =>
      expect(result.statusCode).toBe(HttpStatusCode.Unauthorized)
    );

    await request(app)
      .post(`${auth}/login`)
      .send({ loginOrEmail: 'User_2', password: '12345678' })
      .expect(HttpStatusCode.Too_Many_Requests);

    await delay(msLimit);

    await request(app)
      .post(`${auth}/login`)
      .send({ loginOrEmail: 'User_2', password: '12345678' })
      .expect(HttpStatusCode.Unauthorized);
  });

  it('+ POST login user with email correct login and password', async () => {
    const tokenCreateRes = await request(app)
      .post(`${auth}/login`)
      .send({ loginOrEmail: newUser?.login, password: '1234567' })
      .expect(HttpStatusCode.Success);

    userToken = tokenCreateRes.body.accessToken;
    userAuth = `Bearer ${userToken}`;
  });

  it('- GET does not get information about user with incorrect token', async () => {
    await request(app)
      .get(`${auth}/me`)
      .set({ Authorization: fakeAuth })
      .expect(HttpStatusCode.Unauthorized);
  });

  it('+ GET information about user with correct token', async () => {
    const expectedData: MeViewModel = {
      email: newUser!.email,
      login: newUser!.login,
      userId: newUser!.id,
    };

    await request(app)
      .get(`${auth}/me`)
      .set({ Authorization: userAuth })
      .expect(HttpStatusCode.Success, expectedData);
  });
});
