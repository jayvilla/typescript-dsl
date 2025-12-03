// src/examples/basic.ts

import { sql } from "./sql";

// Example 1 — simple equality
const simple = sql
  .from("users")
  .select("id", "email", "createdAt")
  .where({ id: 123 })
  .orderBy("createdAt", "desc")
  .toSQL();

console.log("Simple query:");
console.log(simple);

// Example 2 — advanced operators
const advanced = sql
  .from("posts")
  .select("id", "title", "createdAt")
  .where({
    userId: { $eq: 42 },
    createdAt: {
      $gt: new Date("2024-01-01"),
      $lt: new Date("2025-01-01"),
    },
    id: { $in: [1, 2, 3] },
  })
  .orderBy("createdAt", "asc")
  .toSQL();

console.log("\nAdvanced query:");
console.log(advanced);

// Try hovering these in your editor to see type errors:
//
// sql
//   .from("users")
//   .where({ id: "not-a-number" }); // ❌ id must be number
//
// sql
//   .from("users")
//   .where({ foo: 123 }); // ❌ "foo" is not a column
