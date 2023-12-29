import mongoose from 'mongoose';
import request from 'supertest';
import { HttpStatusCode, RouterPaths } from '../src/constants';
import {
  superAdminLogin,
  superAdminPassword,
} from '../src/middlewares/superAdminAuthorization';
import { app } from '../src/settings';
import {
  ErrorResult,
  Paginator,
  UserInputModel,
  UserViewModel,
} from '../src/types';

const { users, testing } = RouterPaths;
const mongoURI =
  process.env.MONGO_URL || 'mongodb://0.0.0.0:27017/blog_platform';

describe(users, () => {
  const token = Buffer.from(
    `${superAdminLogin}:${superAdminPassword}`
  ).toString('base64');
  const auth = `Basic ${token}`;
  const wrongId = '123456789101112131415161';

  let newUser: UserViewModel | null = null;
  const emptyGetAllResponse: Paginator<UserViewModel> = {
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

  it('- GET does not get users with incorrect login and password', async () => {
    await request(app).get(users).expect(HttpStatusCode.Unauthorized);
  });

  it('+ GET users = []', async () => {
    await request(app)
      .get(users)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.Success, emptyGetAllResponse);
  });

  it('- POST does not create user with incorrect login and password', async () => {
    await request(app).post(users).send().expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(users).set({ Authorization: auth });
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('- POST does not create user with incorrect data', async () => {
    const inputData: UserInputModel = {
      login: '',
      password: '',
      email: '',
    };

    const errorResult: ErrorResult = {
      errorsMessages: [
        { field: 'login', message: 'Invalid login.' },
        {
          field: 'password',
          message: 'Invalid password.',
        },
        {
          field: 'email',
          message: 'Invalid email.',
        },
      ],
    };

    await request(app)
      .post(users)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Bad_Request, errorResult);

    const res = await request(app).get(users).set({ Authorization: auth });
    expect(res.body).toEqual(emptyGetAllResponse);
  });

  it('+ POST creates user with correct data', async () => {
    const inputData: UserInputModel = {
      login: 'User_1',
      password: '1234567',
      email: 'newuser@example.com',
    };

    const createRes = await request(app)
      .post(users)
      .set({ Authorization: auth })
      .send(inputData)
      .expect(HttpStatusCode.Created);

    newUser = createRes.body;

    const getRes = await request(app).get(users).set({ Authorization: auth });
    const foundUser = getRes.body.items.find(
      (user: UserViewModel) => user.id === newUser?.id
    );

    expect(foundUser).toEqual(newUser);
  });

  it('- DELETE does not delete user by ID with incorrect login and password', async () => {
    await request(app)
      .delete(`${users}/${newUser?.id}`)
      .expect(HttpStatusCode.Unauthorized);

    const res = await request(app).get(users).set({ Authorization: auth });
    const foundUser = res.body.items.find(
      (user: UserViewModel) => user.id === newUser?.id
    );

    expect(foundUser).toEqual(newUser);
  });

  it('- DELETE does not delete user by ID with incorrect id', async () => {
    await request(app)
      .delete(`${users}/${wrongId}`)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.Not_Found);

    const res = await request(app).get(users).set({ Authorization: auth });
    const foundUser = res.body.items.find(
      (user: UserViewModel) => user.id === newUser?.id
    );
    expect(foundUser).toEqual(newUser);
  });

  it('+ DELETE user by ID with correct id', async () => {
    await request(app)
      .delete(`${users}/${newUser?.id}`)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.No_Content);

    await request(app)
      .get(`${users}/${newUser?.id}`)
      .set({ Authorization: auth })
      .expect(HttpStatusCode.Not_Found);
  });
});
