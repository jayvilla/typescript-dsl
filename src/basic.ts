// src/examples/basic.ts

import { sql } from "./sql";

async function main() {
  // ---------------------------------
  // Example 1 — Simple typed query
  // ---------------------------------
  const simpleQuery = sql
    .from("users")
    .select("id", "email", "createdAt")
    .where({
      id: { $gt: 100 },
    })
    .orderBy("createdAt", "desc")
    .limit(10)
    .offset(20);

  const simpleSQL = simpleQuery.toSQL();
  const simpleResult = await simpleQuery.execute();

  console.log("Simple SQL:");
  console.log(simpleSQL);
  console.log("\nSimple result:");
  console.log(simpleResult);

  // Hover over simpleResult in your editor:
  //   { id: number; email: string; createdAt: Date }[]

  // ---------------------------------
  // Example 2 — Join + select subset
  // ---------------------------------
  const joinedQuery = sql
    .from("users")
    .join("posts", "id", "userId")
    .select("email", "title")
    .orderBy("createdAt", "desc");

  const joinedSQL = joinedQuery.toSQL();
  const joinedResult = await joinedQuery.execute();

  console.log("\nJoined SQL:");
  console.log(joinedSQL);
  console.log("\nJoined result:");
  console.log(joinedResult);

  // Hover over joinedResult:
  //   { email: string; title: string }[]
}

main().catch((err) => {
  console.error("Error running examples:", err);
});
