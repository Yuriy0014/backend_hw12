export enum HttpStatusCode {
  Success = 200,
  Created = 201,
  No_Content = 204,
  Bad_Request = 400,
  Unauthorized = 401,
  Forbidden = 403,
  Not_Found = 404,
  Too_Many_Requests = 429,
}

export enum LikeStatus {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

export enum UserLikeCollection {
  Comments = 'comments',
  Posts = 'posts',
}

export enum LikeableEntity {
  Comment = 'comment',
  Post = 'post',
}

export const RouterPaths = {
  blogs: '/blogs',
  posts: '/posts',
  users: '/users',
  comments: '/comments',
  securityDevices: '/security/devices',

  auth: '/auth',
  testing: '/testing/all-data',
  sessions: '/sessions',
  likes: '/likes',
};
