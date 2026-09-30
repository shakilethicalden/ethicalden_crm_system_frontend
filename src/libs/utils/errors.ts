/** Human-readable message from an unknown thrown value. */
export function readError(error: unknown) {
  return error instanceof Error && error.message ? error.message : "Something went wrong.";
}
