// src/sql.ts

import { TableName, TableOf, ExtractColumns } from "./types";

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
   * WHERE — loose for now, strict in Phase 3
   */
  where(conditions: Partial<Record<ExtractColumns<TTable>, any>>) {
    const next = new QueryBuilder<TTable>();
    next._select = this._select;
    next._from = this._from;
    next._where = conditions;
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
   * String SQL generator (runtime only)
   */
  toSQL(): string {
    if (!this._select.length) throw new Error("No columns selected");
    if (!this._from) throw new Error("No table selected");

    let sql = `SELECT ${this._select.join(", ")} FROM ${this._from}`;

    if (this._where) {
      const conditions = Object.entries(this._where)
        .map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
        .join(" AND ");
      sql += ` WHERE ${conditions}`;
    }

    if (this._orderBy) {
      sql += ` ORDER BY ${this._orderBy.column} ${this._orderBy.direction}`;
    }

    return sql + ";";
  }
}

/**
 * Root entry point
 */
export const sql = new QueryBuilder();
