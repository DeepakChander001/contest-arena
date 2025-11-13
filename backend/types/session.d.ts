interface SessionEmailInfo {
  value?: string;
}

export interface SessionUser {
  id?: string;
  email?: string;
  googleEmail?: string;
  googleId?: string;
  googleName?: string;
  googleAvatarUrl?: string;
  avatarUrl?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  emails?: SessionEmailInfo[];
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

export {};

