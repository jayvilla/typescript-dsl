// src/schema.ts

/**
 * Phase 2 — Typed database schema
 * You can expand this later.
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
