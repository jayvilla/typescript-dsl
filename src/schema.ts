// src/schema.ts

/**
 * Database schema for the TypeScript DSL.
 * You can expand this with more tables over time.
 */

export type UserTable = {
  id: number;
  email: string;
  createdAt: Date;
};

export type PostTable = {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: Date;
};

export type Tables = {
  users: UserTable;
  posts: PostTable;
};
