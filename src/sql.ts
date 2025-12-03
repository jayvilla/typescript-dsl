// src/sql.ts

import {
  TableName,
  TableOf,
  ExtractColumns,
  WhereInput,
  ResultRow,
} from "./types";

/**
 * QueryBuilder<TTable, TSelectedCols>
 */
export class QueryBuilder<
  TTable = null,
  TSelectedCols extends readonly (keyof TTable)[] | null = null
> {
  private _select: string[] = [];
  private _from: string | null = null;
  private _where: Record<string, any> | null = null;
  private _orderBy: { column: string; direction: "asc" | "desc" } | null = null;

  /**
   * SELECT — track selected columns as a TS tuple
   */
  select<K extends ExtractColumns<TTable>, const Cols extends readonly K[]>(
    ...columns: Cols
  ) {
    const next = new QueryBuilder<TTable, Cols>();
    next._select = [...columns] as string[];
    next._from = this._from;
    next._where = this._where;
    next._orderBy = this._orderBy;
    return next;
  }

  /**
   * FROM — sets table + resets selected type
   */
  from<Name extends TableName>(table: Name) {
    const next = new QueryBuilder<TableOf<Name>, null>();
    next._from = table;
    return next;
  }

  /**
   * WHERE
   */
  where(conditions: WhereInput<TTable>) {
    const next = new QueryBuilder<TTable, TSelectedCols>();
    next._select = this._select;
    next._from = this._from;
    next._where = conditions as Record<string, any>;
    next._orderBy = this._orderBy;
    return next;
  }

  /**
   * ORDER BY
   */
  orderBy<K extends ExtractColumns<TTable>>(
    column: K,
    direction: "asc" | "desc" = "asc"
  ) {
    const next = new QueryBuilder<TTable, TSelectedCols>();
    next._select = this._select;
    next._from = this._from;
    next._where = this._where;
    next._orderBy = { column: column as string, direction };
    return next;
  }

  /**
   * 🔥 EXECUTE — fully typed result shape
   */
  async execute(): Promise<ResultRow<TTable, TSelectedCols>[]> {
    // Fake DB results — Phase 5 can replace with real engines
    const mock: any[] = [
      this._select.length
        ? Object.fromEntries(this._select.map((c) => [c, `<mock_${c}_value>`]))
        : {},
    ];

    return mock as ResultRow<TTable, TSelectedCols>[];
  }

  /**
   * Runtime SQL string
   */
  toSQL(): string {
    if (!this._select.length) throw new Error("No columns selected");
    if (!this._from) throw new Error("No table selected");

    let sql = `SELECT ${this._select.join(", ")} FROM ${this._from}`;

    if (this._where) {
      const conditions = Object.entries(this._where)
        .map(([k, v]) => {
          if (typeof v === "object") return `${k} = ${JSON.stringify(v)}`;
          return `${k} = ${JSON.stringify(v)}`;
        })
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
 * Entry point
 */
export const sql = new QueryBuilder();
