// src/types.ts

import { Tables } from "./schema";

/**
 * Utility types for generics
 */

export type TableName = keyof Tables;

export type TableOf<Name extends TableName> = Tables[Name];

export type ExtractColumns<T> = keyof T;
