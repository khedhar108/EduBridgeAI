import { COOKIE_ROWS } from "../content/cookies";

export function CookieInventoryTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-border bg-muted/50 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 font-medium">Name</th>
            <th className="px-3 py-2 font-medium">Kind</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Purpose</th>
            <th className="px-3 py-2 font-medium">TTL</th>
          </tr>
        </thead>
        <tbody>
          {COOKIE_ROWS.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-xs text-foreground">
                {row.name}
              </td>
              <td className="px-3 py-2 text-muted-foreground">{row.kind}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.category}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.purpose}</td>
              <td className="px-3 py-2 text-muted-foreground">{row.ttl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
