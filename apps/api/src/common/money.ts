/** Money is stored as BigInt cents and sent as JSON numbers; refuse anything that would lose precision. */
export function centsToNumber(cents: bigint): number {
  if (cents > BigInt(Number.MAX_SAFE_INTEGER))
    throw new RangeError(`Amount out of range: ${cents}`);
  return Number(cents);
}
