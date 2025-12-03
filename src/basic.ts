// src/examples/basic.ts

import { sql } from "./sql";

async function main() {
  const q = sql
    .from("users")
    .select("id", "email")
    .where({ id: 123 })
    .orderBy("createdAt");

  const result = await q.execute();

  console.log("Query result:", result);
  // Hover `result` → inferred type:
  //     { id: number; email: string }[]
}

main();
