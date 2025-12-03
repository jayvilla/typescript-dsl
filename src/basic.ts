// src/examples/basic.ts

import { sql } from "./sql";

const query = sql
  .select("id", "email")
  .from("users")
  .where({ id: 123 })
  .orderBy("createdAt", "desc");

console.log("Generated SQL:");
console.log(query.toSQL());
