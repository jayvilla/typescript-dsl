// src/sql.ts

/**
 * Phase 1 — Minimal runtime SQL builder
 * No deep types yet — just fluent API + SQL string generation.
 */

export class QueryBuilder {
  private _select: string[] = [];
  private _from: string | null = null;
  private _where: Record<string, any> | null = null;
  private _orderBy: { column: string; direction: "asc" | "desc" } | null = null;

  select(...columns: string[]) {
    const next = new QueryBuilder();
    next._select = columns;
    next._from = this._from;
    next._where = this._where;
    next._orderBy = this._orderBy;
    return next;
  }

  from(table: string) {
    const next = new QueryBuilder();
    next._select = this._select;
    next._from = table;
    next._where = this._where;
    next._orderBy = this._orderBy;
    return next;
  }

  where(conditions: Record<string, any>) {
    const next = new QueryBuilder();
    next._select = this._select;
    next._from = this._from;
    next._where = conditions;
    next._orderBy = this._orderBy;
    return next;
  }

  orderBy(column: string, direction: "asc" | "desc" = "asc") {
    const next = new QueryBuilder();
    next._select = this._select;
    next._from = this._from;
    next._where = this._where;
    next._orderBy = { column, direction };
    return next;
  }

  toSQL(): string {
    if (!this._select.length) {
      throw new Error("No columns selected");
    }
    if (!this._from) {
      throw new Error("No table selected");
    }

    let sql = `SELECT ${this._select.join(", ")} FROM ${this._from}`;

    if (this._where) {
      const conditions = Object.entries(this._where)
        .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
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

export const sql = new QueryBuilder();
