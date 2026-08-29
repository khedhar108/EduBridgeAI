"use client";

import { useState, useTransition } from "react";
import { Switch } from "@repo/ui/components/switch";
import { setHubFlagAction } from "../actions/set-hub-flag";

export type HubMatrixGroup = {
  id: string;
  title: string;
  items: {
    key: string;
    label: string;
    cells: {
      role: string;
      roleLabel: string;
      on: boolean;
      locked: boolean;
    }[];
  }[];
};

function HubFlagSwitch({
  workspace,
  capability,
  role,
  label,
  roleLabel,
  on,
  locked,
  onError,
}: {
  workspace: string;
  capability: string;
  role: string;
  label: string;
  roleLabel: string;
  on: boolean;
  locked: boolean;
  onError: (message: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Switch
      checked={on}
      disabled={locked || pending}
      size="sm"
      aria-label={`${label} for ${roleLabel}`}
      onCheckedChange={
        locked
          ? undefined
          : (checked) => {
              startTransition(async () => {
                const result = await setHubFlagAction(
                  workspace,
                  capability,
                  role,
                  checked,
                );
                onError(result.error ?? null);
              });
            }
      }
    />
  );
}

export function ControlHubMatrix({
  workspace,
  groups,
}: {
  workspace: string;
  groups: HubMatrixGroup[];
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-10">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {groups.map((group) => (
        <section key={group.id} className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">{group.title}</h2>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[40rem] text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2 text-left font-medium">Permission</th>
                  {group.items[0]?.cells.map((cell) => (
                    <th
                      key={cell.role}
                      className="px-3 py-2 text-center font-medium capitalize"
                    >
                      {cell.roleLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr
                    key={item.key}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-3 py-2">{item.label}</td>
                    {item.cells.map((cell) => (
                      <td key={cell.role} className="px-3 py-2 text-center">
                        <HubFlagSwitch
                          workspace={workspace}
                          capability={item.key}
                          role={cell.role}
                          label={item.label}
                          roleLabel={cell.roleLabel}
                          on={cell.on}
                          locked={cell.locked}
                          onError={setError}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
