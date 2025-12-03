// src/examples/basic.ts

import { sql } from "./sql";

// Fully type-safe:
const query = sql
  .from("users") // table fixed: UserTable
  .select("id", "email") // ❌ cannot select "foo"
  .where({ id: 123 }) // ❌ wrong column type will error
  .orderBy("createdAt", "desc") // fully typed
  .toSQL();

console.log(query);

// sql.from("users").select("foo");
// sql.from("users").orderBy("body");
// sql.from("posts").where({ title: 123 });
