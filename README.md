# 📦 TypeScript SQL DSL — Zero-to-Expert Challenge

A fully typed SQL Query Builder built using advanced TypeScript: **generics**, **discriminated unions**, **branded types**, **AST modeling**, **typed joins**, **typed selects**, and **fluent builder patterns**.

This project is intentionally designed as a **FAANG-level TypeScript mastery exercise**, showcasing the same language techniques used inside libraries like Prisma, Drizzle ORM, and Kysely.

---

## 🚀 Features

### ✅ Fully Typed Fluent API

```ts
sql
  .from("users")
  .select("id", "email")
  .where({ id: { $gt: 10 } })
  .orderBy("createdAt", "desc")
  .toSQL();
```
