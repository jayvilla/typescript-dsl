// src/sql.ts

import { TableName, TableOf, ExtractColumns, WhereInput } from "./types";

/**
 * QueryBuilder<TTable>
 * TTable = the inferred table type from .from("users")
 */
export class QueryBuilder<TTable = null> {
  private _select: string[] = [];
  private _from: string | null = null;
  private _where: Record<string, any> | null = null;
  private _orderBy: { column: string; direction: "asc" | "desc" } | null = null;

  /**
   * SELECT — only allowed after .from(), so columns must come from TTable
   */
  select<K extends TTable extends null ? string : ExtractColumns<TTable>>(
    ...columns: K[]
  ) {
    const next = new QueryBuilder<TTable>();
    next._select = columns as string[];
    next._from = this._from;
    next._where = this._where;
    next._orderBy = this._orderBy;
    return next;
  }

  /**
   * FROM — sets the table + type context
   */
  from<Name extends TableName>(table: Name) {
    const next = new QueryBuilder<TableOf<Name>>();
    next._from = table;
    return next;
  }

  /**
   * WHERE — strongly typed by table schema.
   *
   * Example:
   *   sql.from("users").where({
   *     id: 123,                      // ✅ id is number
   *     email: { $eq: "foo@bar.com" } // ✅ email is string
   *   })
   */
  where(conditions: WhereInput<TTable>) {
    const next = new QueryBuilder<TTable>();
    next._select = this._select;
    next._from = this._from;
    next._where = conditions as Record<string, any>;
    next._orderBy = this._orderBy;
    return next;
  }

  /**
   * ORDER BY — type-safe column names
   */
  orderBy<K extends ExtractColumns<TTable>>(
    column: K,
    direction: "asc" | "desc" = "asc"
  ) {
    const next = new QueryBuilder<TTable>();
    next._select = this._select;
    next._from = this._from;
    next._where = this._where;
    next._orderBy = { column: column as string, direction };
    return next;
  }

  /**
   * Helper: format a single WHERE condition into SQL.
   */
  private formatCondition(key: string, value: any): string {
    // Operator object: { $gt: 10, $lt: 100, $in: [...] }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const parts: string[] = [];

      if (value.$eq !== undefined) {
        parts.push(`${key} = ${JSON.stringify(value.$eq)}`);
      }
      if (value.$ne !== undefined) {
        parts.push(`${key} <> ${JSON.stringify(value.$ne)}`);
      }
      if (value.$gt !== undefined) {
        parts.push(`${key} > ${JSON.stringify(value.$gt)}`);
      }
      if (value.$gte !== undefined) {
        parts.push(`${key} >= ${JSON.stringify(value.$gte)}`);
      }
      if (value.$lt !== undefined) {
        parts.push(`${key} < ${JSON.stringify(value.$lt)}`);
      }
      if (value.$lte !== undefined) {
        parts.push(`${key} <= ${JSON.stringify(value.$lte)}`);
      }
      if (value.$in !== undefined && Array.isArray(value.$in)) {
        const list = value.$in
          .map((v: unknown) => JSON.stringify(v))
          .join(", ");
        parts.push(`${key} IN (${list})`);
      }

      // Fallback if somehow no operators matched
      if (!parts.length) {
        return `${key} = ${JSON.stringify(value)}`;
      }

      return parts.join(" AND ");
    }

    // Primitive value: { id: 123 }
    return `${key} = ${JSON.stringify(value)}`;
  }

  /**
   * String SQL generator (runtime only)
   */
  toSQL(): string {
    if (!this._select.length) throw new Error("No columns selected");
    if (!this._from) throw new Error("No table selected");

    let sql = `SELECT ${this._select.join(", ")} FROM ${this._from}`;

    if (this._where) {
      const conditions = Object.entries(this._where)
        .map(([k, v]) => this.formatCondition(k, v))
        .join(" AND ");
      sql += ` WHERE ${conditions}`;
    }

    if (this._orderBy) {
      sql += ` ORDER BY ${
        this._orderBy.column
      } ${this._orderBy.direction.toUpperCase()}`;
    }

    return sql + ";";
  }
}

/**
 * Root entry point
 */
export const sql = new QueryBuilder();
