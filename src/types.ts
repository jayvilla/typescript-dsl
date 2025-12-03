// src/types.ts

import { Tables } from "./schema";

/**
 * Core table helpers
 */
export type TableName = keyof Tables;

export type TableOf<Name extends TableName> = Tables[Name];

/**
 * Extracts column names from a table type.
 * Safe when T is null (used before .from()).
 */
export type ExtractColumns<T> = T extends null ? never : keyof T;

/**
 * Allowed condition value for a given column type T.
 * Supports:
 *  - direct equality:   { id: 123 }
 *  - operators object:  { id: { $gt: 10, $lt: 100 } }
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

/**
 * Typed WHERE input for a given table.
 */
export type WhereInput<TTable> = TTable extends null
  ? never
  : Partial<{
      [K in keyof TTable]: ConditionValue<TTable[K]>;
    }>;
