// Turns a Postgres/PostgREST error into a sentence a farm worker can act on.
//
// Errors raised on purpose by our own database rules (approval guards,
// same-farm checks, stock checks -- SQLSTATE P0001) are already written as
// plain sentences, so they pass through untouched. Only raw constraint
// failures, which read like "duplicate key value violates unique
// constraint animals_farm_id_tag_key", need translating.
type DbError = { code?: string; message: string };

export function friendlyDbError(error: DbError, hints: { unique?: string } = {}): string {
  switch (error.code) {
    case "23505":
      return hints.unique ?? "That already exists on this farm.";
    case "23514":
      return "One of the values is outside the allowed range -- check quantities and amounts are positive.";
    case "23503":
      return "One of the selected items no longer exists.";
    case "42501":
      return "You don't have permission to do that.";
    default:
      return error.message;
  }
}
