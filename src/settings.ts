import cookieParser from 'cookie-parser';
import express from 'express';
import { RouterPaths } from './constants';
import {
  authRouter,
  blogRouter,
  commentRouter,
  likeRouter,
  postRouter,
  securityDeviceRouter,
  testingRouter,
  userRouter,
} from './routers';

export const app = express();

// app.set('trust proxy', true);

app.use(express.json());
app.use(cookieParser());
app.use(RouterPaths.blogs, blogRouter);
app.use(RouterPaths.posts, postRouter);
app.use(RouterPaths.users, userRouter);
app.use(RouterPaths.comments, commentRouter);
app.use(RouterPaths.securityDevices, securityDeviceRouter);

app.use(RouterPaths.auth, authRouter);
app.use(RouterPaths.testing, testingRouter);
app.use(RouterPaths.likes, likeRouter);
