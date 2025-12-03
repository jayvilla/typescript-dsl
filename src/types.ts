// src/types.ts

import { Tables } from "./schema";

/**
 * Core table helpers
 */
export type TableName = keyof Tables;
export type TableOf<Name extends TableName> = Tables[Name];

/**
 * Extract column names (safe for null)
 */
export type ExtractColumns<T> = T extends null ? never : keyof T;

/**
 * WHERE typing (from Phase 3)
 */
export type ConditionValue<T> =
  | T
  | {
      $eq?: T;
      $ne?: T;
      $gt?: T;
      $gte?: T;
      $lt?: T;
      $lte?: T;
      $in?: readonly T[];
    };

export type WhereInput<TTable> = TTable extends null
  ? never
  : Partial<{
      [K in keyof TTable]: ConditionValue<TTable[K]>;
    }>;

/**
 * 👇 NEW FOR PHASE 4 — Result Typing
 *
 * Given a table T and a tuple of selected columns Cols,
 * return { [K in Cols[number]]: T[K] }
 *
 * If no columns → full row
 */
export type ResultRow<
  TTable,
  Cols extends readonly (keyof TTable)[] | null
> = Cols extends null
  ? TTable
  : Cols extends readonly (infer K)[]
  ? K extends keyof TTable
    ? { [P in K]: TTable[P] }
    : never
  : TTable;
