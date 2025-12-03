// src/sql.ts

import {
  TableName,
  TableOf,
  ExtractColumns,
  WhereInput,
  ResultRow,
  SqlString,
  QueryAST,
  JoinClause,
} from "./types";

/**
 * QueryBuilder
 *
 * TTable        - the current table type context (possibly joined)
 * TSelectedCols - tuple of selected columns, or null if not set
 * TAliases      - alias mapping for select({ alias: "column" }) style
 */
export class QueryBuilder<
  TTable = null,
  TSelectedCols extends readonly (keyof TTable)[] | null = null,
  TAliases extends Record<string, keyof TTable> | null = null
> {
  private _from: string | null = null;
  private _select: string[] = [];
  private _where: Record<string, any> | null = null;
  private _orderBy: { column: string; direction: "asc" | "desc" } | null = null;
  private _limit: number | null = null;
  private _offset: number | null = null;
  private _joins: JoinClause[] = [];

  // ------------------------
  // FROM
  // ------------------------

  /**
   * FROM — set the table and reset selection/aliases.
   */
  from<Name extends TableName>(
    table: Name
  ): QueryBuilder<TableOf<Name>, null, null> {
    const next = new QueryBuilder<TableOf<Name>, null, null>();
    next._from = table;
    return next;
  }

  // ------------------------
  // SELECT
  // ------------------------

  /**
   * SELECT with alias mapping:
   *
   *   select({ userId: "id", emailAddress: "email" })
   *
   * Result type:
   *   { userId: number; emailAddress: string }[]
   */
  select<M extends Record<string, ExtractColumns<TTable>>>(
    mapping: M
  ): QueryBuilder<TTable, null, M>;

  /**
   * SELECT with explicit columns:
   *
   *   select("id", "email")
   *
   * Result type:
   *   { id: number; email: string }[]
   */
  select<K extends ExtractColumns<TTable>, const Cols extends readonly K[]>(
    ...columns: Cols
  ): QueryBuilder<TTable, Cols, null>;

  // Implementation
  select(...args: any[]): any {
    // Mapping version: select({ alias: "column" })
    if (
      args.length === 1 &&
      typeof args[0] === "object" &&
      !Array.isArray(args[0])
    ) {
      const mapping = args[0] as Record<string, string>;
      const next = new QueryBuilder<any, null, any>();
      next._from = this._from;
      next._where = this._where;
      next._orderBy = this._orderBy;
      next._limit = this._limit;
      next._offset = this._offset;
      next._joins = [...this._joins];

      next._select = Object.entries(mapping).map(
        ([alias, column]) => `${String(column)} AS ${alias}`
      );

      return next;
    }

    // Column list version: select("id", "email")
    const columns = args as string[];
    const next = new QueryBuilder<any, any, null>();
    next._from = this._from;
    next._where = this._where;
    next._orderBy = this._orderBy;
    next._limit = this._limit;
    next._offset = this._offset;
    next._joins = [...this._joins];
    next._select = [...columns];
    return next;
  }

  // ------------------------
  // WHERE
  // ------------------------

  /**
   * WHERE — strongly typed by table schema.
   *
   * Example:
   *   sql.from("users").where({
   *     id: 123,
   *     email: { $eq: "foo@bar.com" },
   *   })
   */
  where(
    conditions: WhereInput<TTable>
  ): QueryBuilder<TTable, TSelectedCols, TAliases> {
    const next = new QueryBuilder<TTable, TSelectedCols, TAliases>();
    next._from = this._from;
    next._select = this._select;
    next._where = conditions as Record<string, any>;
    next._orderBy = this._orderBy;
    next._limit = this._limit;
    next._offset = this._offset;
    next._joins = [...this._joins];
    return next;
  }

  // ------------------------
  // ORDER BY
  // ------------------------

  orderBy<K extends ExtractColumns<TTable>>(
    column: K,
    direction: "asc" | "desc" = "asc"
  ): QueryBuilder<TTable, TSelectedCols, TAliases> {
    const next = new QueryBuilder<TTable, TSelectedCols, TAliases>();
    next._from = this._from;
    next._select = this._select;
    next._where = this._where;
    next._orderBy = { column: String(column), direction };
    next._limit = this._limit;
    next._offset = this._offset;
    next._joins = [...this._joins];
    return next;
  }

  // ------------------------
  // JOIN
  // ------------------------

  /**
   * JOIN another table.
   *
   * After join, the table type becomes TTable & JoinedTable.
   */
  join<
    JoinName extends TableName,
    LeftCol extends ExtractColumns<TTable>,
    RightCol extends ExtractColumns<TableOf<JoinName>>
  >(
    table: JoinName,
    left: LeftCol,
    right: RightCol
  ): QueryBuilder<TTable & TableOf<JoinName>, TSelectedCols, TAliases> {
    const next = new QueryBuilder<
      TTable & TableOf<JoinName>,
      TSelectedCols,
      TAliases
    >();
    next._from = this._from;
    next._select = this._select;
    next._where = this._where;
    next._orderBy = this._orderBy;
    next._limit = this._limit;
    next._offset = this._offset;
    next._joins = [
      ...this._joins,
      {
        table: String(table),
        onLeft: String(left),
        onRight: String(right),
      },
    ];
    return next;
  }

  // ------------------------
  // LIMIT / OFFSET
  // ------------------------

  limit(n: number): QueryBuilder<TTable, TSelectedCols, TAliases> {
    const next = new QueryBuilder<TTable, TSelectedCols, TAliases>();
    next._from = this._from;
    next._select = this._select;
    next._where = this._where;
    next._orderBy = this._orderBy;
    next._limit = n;
    next._offset = this._offset;
    next._joins = [...this._joins];
    return next;
  }

  offset(n: number): QueryBuilder<TTable, TSelectedCols, TAliases> {
    const next = new QueryBuilder<TTable, TSelectedCols, TAliases>();
    next._from = this._from;
    next._select = this._select;
    next._where = this._where;
    next._orderBy = this._orderBy;
    next._limit = this._limit;
    next._offset = n;
    next._joins = [...this._joins];
    return next;
  }

  // ------------------------
  // EXECUTE
  // ------------------------

  /**
   * EXECUTE — typed result based on select() and aliases.
   * Uses mock data — you can wire this to a real DB in the future.
   */
  async execute(): Promise<ResultRow<TTable, TSelectedCols, TAliases>[]> {
    if (!this._from) {
      throw new Error("Cannot execute a query without a FROM clause.");
    }

    // Build a mock row based on selected columns or aliases.
    const row: Record<string, unknown> = {};

    if (this._select.length > 0) {
      for (const expr of this._select) {
        // Handle "column AS alias"
        const [colPart, aliasPart] = expr.split(/\s+AS\s+/i);
        const key = aliasPart ?? colPart;
        row[key] = `<mock_${key}_value>`;
      }
    }

    // If nothing selected (edge case), return an empty object.
    const mock = [row];

    return mock as ResultRow<TTable, TSelectedCols, TAliases>[];
  }

  // ------------------------
  // AST + SQL
  // ------------------------

  /**
   * Internal helper to format WHERE conditions into SQL.
   */
  private formatCondition(key: string, value: any): string {
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

      if (!parts.length) {
        return `${key} = ${JSON.stringify(value)}`;
      }

      return parts.join(" AND ");
    }

    return `${key} = ${JSON.stringify(value)}`;
  }

  /**
   * Serialize the current query into an AST structure.
   */
  toAST(): QueryAST {
    if (!this._from) {
      throw new Error("Cannot build AST without a FROM table.");
    }

    return {
      type: "select",
      table: this._from,
      columns: this._select,
      where: this._where,
      orderBy: this._orderBy,
      limit: this._limit,
      offset: this._offset,
      joins: this._joins,
    };
  }

  /**
   * Compile the AST into a branded SQL string.
   */
  toSQL(): SqlString {
    const ast = this.toAST();

    let sql = `SELECT ${
      ast.columns.length ? ast.columns.join(", ") : "*"
    } FROM ${ast.table}`;

    if (ast.joins && ast.joins.length) {
      for (const j of ast.joins) {
        sql += ` JOIN ${j.table} ON ${j.onLeft} = ${j.onRight}`;
      }
    }

    if (ast.where && Object.keys(ast.where).length) {
      const conditions = Object.entries(ast.where)
        .map(([k, v]) => this.formatCondition(k, v))
        .join(" AND ");
      sql += ` WHERE ${conditions}`;
    }

    if (ast.orderBy) {
      sql += ` ORDER BY ${
        ast.orderBy.column
      } ${ast.orderBy.direction.toUpperCase()}`;
    }

    if (ast.limit != null) {
      sql += ` LIMIT ${ast.limit}`;
    }

    if (ast.offset != null) {
      sql += ` OFFSET ${ast.offset}`;
    }

    return (sql + ";") as SqlString;
  }
}

/**
 * Root entry point.
 */
export const sql = new QueryBuilder();
