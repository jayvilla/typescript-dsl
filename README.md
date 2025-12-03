📦 TypeScript SQL DSL — Zero-to-Expert Challenge

A fully typed SQL Query Builder built using advanced TypeScript: generics, discriminated unions, branded types, AST modeling, typed joins, typed selects, and fluent builder patterns.

This project is intentionally designed as a FAANG-level TypeScript mastery exercise, showcasing the same language techniques used inside libraries like Prisma, Drizzle ORM, and Kysely.

🚀 Features
✅ Fully Typed Fluent API
sql
.from("users")
.select("id", "email")
.where({ id: { $gt: 10 } })
.orderBy("createdAt", "desc")
.toSQL();

✅ Strong Column Safety

Only real table columns are allowed

Type-checked where() values

Auto-complete everywhere

Full type inference across chained calls

✅ Typed execute()

The return type is automatically inferred from select():

const result = await sql
.from("users")
.select("id", "email")
.execute();

// result:
// { id: number; email: string }[]

✅ Advanced WHERE Operators

Supports:

$eq / $ne

$gt / $gte

$lt / $lte

$in

.where({
createdAt: {
$gt: new Date("2024-01-01"),
$lt: new Date("2025-01-01"),
}
})

✅ Typed JOINs with Foreign Keys
sql
.from("users")
.join("posts", "id", "userId")
.select("email", "title");

After the join, the table context becomes:

UserTable & PostTable

✅ Aliased Selects
select({ userId: "id", emailAddress: "email" })

Produces:

{ userId: number; emailAddress: string }[]

✅ Query AST

Every query can be serialized into a JSON AST:

query.toAST();

Great for debugging, testing, or writing devtools.

✅ Branded SQL Output

Prevents mixing SQL strings with user input accidentally:

type SqlString = string & { \_\_brand: "SqlString" };

📁 Folder Structure
project-5-typescript-dsl/
src/
schema.ts # Table definitions
types.ts # Generic helpers, operators, AST, branded types
sql.ts # Core query builder
examples/
basic.ts # Sample usage
tsconfig.json
package.json
README.md

🛠️ Installation

1. Install dependencies
   pnpm install

2. Run examples
   pnpm dev

🧠 Architecture Overview

1. Typed Schema
   export type UserTable = {
   id: number;
   email: string;
   createdAt: Date;
   };

Mapped into a database structure:

export type Tables = {
users: UserTable;
posts: PostTable;
};

2. Generic QueryBuilder State Machine

Core builder signature:

class QueryBuilder<
TTable,
TSelectedCols extends readonly (keyof TTable)[] | null,
TAliases extends Record<string, keyof TTable> | null

> {}

TTable tracks the active table (and joined tables)

TSelectedCols tracks the selected columns

TAliases tracks alias → column mappings

This unlocks precise result-type inference in .execute().

3. Query AST
   interface QueryAST {
   type: "select";
   table: string;
   columns: string[];
   where?: any;
   orderBy?: { column: string; direction: "asc" | "desc" } | null;
   limit?: number | null;
   offset?: number | null;
   joins?: JoinClause[];
   }

The AST lets you:

Run SQL printers

Create devtools

Serialize queries

Build client/server query shuttling

📌 Example Queries
Simple Typed Query
const q = sql
.from("users")
.select("id", "email", "createdAt")
.where({ id: { $gt: 50 } })
.orderBy("createdAt", "desc")
.limit(10)
.offset(20);

console.log(q.toSQL());

Output:

SELECT id, email, createdAt FROM users WHERE id > 50 ORDER BY createdAt DESC LIMIT 10 OFFSET 20;

Join Query
const q = sql
.from("users")
.join("posts", "id", "userId")
.select("email", "title");

Output:

SELECT email, title FROM users
JOIN posts ON id = userId;

Alias Select
sql
.from("users")
.select({
userId: "id",
emailAddress: "email"
})
.toSQL();

Resulting type:

{
userId: number;
emailAddress: string;
}[]

Typed Execute
const result = await sql
.from("posts")
.select("id", "title")
.execute();

Final inferred type:

{ id: number; title: string }[]

🧪 Running Examples

This will run src/examples/basic.ts:

pnpm dev

🎓 What You Learn
Advanced TypeScript Concepts

Generic state machines

Type-level programming

Mapped types

Conditional types

Discriminated unions

Branded (nominal) types

Enforcing immutability

Tuple inference

Template literal types

Fluent API design with generics

Strict typing around unions + operators
