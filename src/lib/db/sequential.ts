/**
 * Runs a list of queries one after another and returns their results in the
 * same shape as `Promise.all`, so it can be dropped in as a replacement.
 *
 * Why: on Vercel the database is often reached through a pooled connection
 * that allows only ONE connection at a time (connection_limit=1). Pages that
 * fire dozens of queries at once with `Promise.all` leave most of them waiting
 * in line until they hit "Timed out fetching a new connection" (Prisma P2024).
 * Prisma queries only start when awaited, so awaiting them in order keeps the
 * connection free for the next one.
 */
export async function sequential<T extends readonly unknown[] | []>(
  values: T
): Promise<{ -readonly [P in keyof T]: Awaited<T[P]> }> {
  const results: unknown[] = [];

  for (const value of values) {
    results.push(await value);
  }

  return results as { -readonly [P in keyof T]: Awaited<T[P]> };
}
