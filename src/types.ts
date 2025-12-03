// src/types.ts

import { Tables } from "./schema";

/**
 * Core table helpers
 */

export type TableName = keyof Tables;

export type TableOf<Name extends TableName> = Tables[Name];

/**
 * Extract column names (safe for null table).
 */
export type ExtractColumns<T> = T extends null ? never : keyof T;

/**
 * Condition values for WHERE clauses.
 * Supports both primitive equality and operator objects.
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
 * Branding helper — creates nominal types
 */
export type Brand<T, Name extends string> = T & { __brand: Name };

/**
 * Branded SQL string — prevents unsafe mixing with regular strings.
 */
export type SqlString = Brand<string, "SqlString">;

/**
 * Join clause representation for the query AST.
 */
export interface JoinClause {
  table: string;
  onLeft: string;
  onRight: string;
}

/**
 * Query AST — serialized representation of a SELECT query.
 */
export interface QueryAST {
  type: "select";
  table: string;
  columns: string[];
  where?: Record<string, any> | null;
  orderBy?: { column: string; direction: "asc" | "desc" } | null;
  limit?: number | null;
  offset?: number | null;
  joins?: JoinClause[];
}

/**
 * Result row type:
 *
 * - If TAliases is provided, the result keys are the alias names.
 * - Else if TSelectedCols is provided, result keys are the selected column names.
 * - Else, the full table row is returned.
 */
export type ResultRow<
  TTable,
  TSelectedCols extends readonly (keyof TTable)[] | null,
  TAliases extends Record<string, keyof TTable> | null
> = TTable extends null
  ? never
  : TAliases extends Record<string, keyof TTable>
  ? {
      [Alias in keyof TAliases]: TTable[TAliases[Alias]];
    }
  : TSelectedCols extends readonly (keyof TTable)[]
  ? {
      [K in TSelectedCols[number]]: TTable[K];
    }
  : TTable;
