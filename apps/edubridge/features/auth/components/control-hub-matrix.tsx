"use client";

import { useState, useTransition } from "react";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";
import { InfoHint } from "@repo/ui/components/info-hint";
import { Switch } from "@repo/ui/components/switch";
import { setHubFlagAction } from "../actions/set-hub-flag";

export type HubMatrixGroup = {
  id: string;
  title: string;
  items: {
    key: string;
    label: string;
    hint: string;
    cells: {
      role: string;
      roleLabel: string;
      on: boolean;
      locked: boolean;
      caution: boolean;
    }[];
  }[];
};

type PendingGrant = {
  capability: string;
  role: string;
  label: string;
  roleLabel: string;
};

function HubFlagSwitch({
  label,
  roleLabel,
  on,
  locked,
  pending,
  onToggle,
}: {
  label: string;
  roleLabel: string;
  on: boolean;
  locked: boolean;
  pending: boolean;
  onToggle: (checked: boolean) => void;
}) {
  return (
    <Switch
      checked={on}
      disabled={locked || pending}
      size="sm"
      className={locked ? "disabled:opacity-100" : undefined}
      title={locked ? "Always on for school admin" : undefined}
      aria-label={`${label} for ${roleLabel}`}
      onCheckedChange={
        locked
          ? undefined
          : (checked) => {
              onToggle(checked);
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
  const [pendingGrant, setPendingGrant] = useState<PendingGrant | null>(null);
  const [pending, startTransition] = useTransition();

  function save(capability: string, role: string, enabled: boolean) {
    startTransition(async () => {
      const result = await setHubFlagAction(
        workspace,
        capability,
        role,
        enabled,
      );
      setError(result.error ?? null);
    });
  }

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
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-0.5">
                        {item.label}
                        <InfoHint
                          label={`About ${item.label}`}
                          title={item.label}
                          side="right"
                        >
                          {item.hint}
                        </InfoHint>
                      </span>
                    </td>
                    {item.cells.map((cell) => (
                      <td key={cell.role} className="px-3 py-2 text-center">
                        <HubFlagSwitch
                          label={item.label}
                          roleLabel={cell.roleLabel}
                          on={cell.on}
                          locked={cell.locked}
                          pending={pending}
                          onToggle={(checked) => {
                            if (cell.caution && checked) {
                              setPendingGrant({
                                capability: item.key,
                                role: cell.role,
                                label: item.label,
                                roleLabel: cell.roleLabel,
                              });
                              return;
                            }
                            save(item.key, cell.role, checked);
                          }}
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
      <ConfirmDialog
        open={pendingGrant !== null}
        onOpenChange={(open) => {
          if (!open) setPendingGrant(null);
        }}
        title={
          pendingGrant
            ? `Give ${pendingGrant.roleLabel} “${pendingGrant.label}”?`
            : "Enable permission?"
        }
        description={
          pendingGrant ? (
            <span>
              {pendingGrant.roleLabel} does not have this by default. They
              get “{pendingGrant.label}” on their next request.
            </span>
          ) : null
        }
        confirmLabel="Enable"
        confirmVariant="default"
        pending={pending}
        onConfirm={() => {
          if (!pendingGrant) return;
          const next = pendingGrant;
          setPendingGrant(null);
          save(next.capability, next.role, true);
        }}
      />
    </div>
  );
}
