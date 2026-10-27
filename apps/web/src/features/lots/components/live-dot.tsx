/** Wax-red dot for lots in auction; pulses unless the user prefers reduced motion. */
export function LiveDot() {
  return (
    <span aria-hidden="true" className="relative inline-flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-lacre opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-lacre" />
    </span>
  );
}
