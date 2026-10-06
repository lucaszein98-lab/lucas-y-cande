/** Renderiza "Lucas & Cande" con el ampersand como gesto tipográfico. */
export function Names({ name, className }: { name: string; className?: string }) {
  const parts = name.split("&");
  if (parts.length !== 2) return <span className={className}>{name}</span>;
  return (
    <span className={className}>
      {parts[0].trim()} <span className="amp">&amp;</span> {parts[1].trim()}
    </span>
  );
}
