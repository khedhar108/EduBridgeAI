"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Spinner } from "@repo/ui/components/spinner";
import { useActionToast } from "@repo/ui/hooks/use-action-toast";
import {
  publishFeePlanAction,
  type PublishFeePlanState,
} from "../actions/publish-fee-plan";
import { DEMO_FEE_HEADS } from "../lib/demo-heads";
import { formatInr, headCodeFromLabel } from "../lib/money";

const initial: PublishFeePlanState = {};

type HeadRow = {
  id: string;
  label: string;
  amountInr: number;
};

let rowSeq = 0;
function nextRow(label = "", amountInr = 0): HeadRow {
  rowSeq += 1;
  return { id: `head-${rowSeq}`, label, amountInr };
}

function rowsFromJson(json?: string): HeadRow[] {
  if (!json) return [nextRow()];
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed) || parsed.length === 0) return [nextRow()];
    return parsed.map((item) => {
      const row = item as { label?: unknown; amountInr?: unknown };
      return nextRow(String(row.label ?? ""), Number(row.amountInr) || 0);
    });
  } catch {
    return [nextRow()];
  }
}

function demoRows(): HeadRow[] {
  return DEMO_FEE_HEADS.map((head) => nextRow(head.label, head.amountInr));
}

type Props = {
  workspace: string;
  planId?: string;
  defaultName?: string;
  defaultClassLabel?: string;
  defaultPaymentMode?: "once" | "quarterly" | "custom";
  defaultHeadsJson?: string;
  startFromDemo?: boolean;
};

export function PublishFeePlanForm({
  workspace,
  planId,
  defaultName = "",
  defaultClassLabel = "",
  defaultPaymentMode = "once",
  defaultHeadsJson,
  startFromDemo = false,
}: Props) {
  const bound = publishFeePlanAction.bind(null, workspace);
  const [state, formAction, pending] = useActionState(bound, initial);
  useActionToast(state, "Fee plan version published.");

  const [fromDemo, setFromDemo] = useState(startFromDemo && !planId);
  const [heads, setHeads] = useState<HeadRow[]>(() =>
    startFromDemo && !planId ? demoRows() : rowsFromJson(defaultHeadsJson),
  );

  const totalAmountInr = heads.reduce((sum, head) => sum + head.amountInr, 0);
  const headsJson = useMemo(
    () =>
      JSON.stringify(
        heads
          .filter((head) => head.label.trim().length > 0)
          .map((head, index) => ({
            code: headCodeFromLabel(head.label, index),
            label: head.label.trim(),
            amountInr: head.amountInr,
          })),
      ),
    [heads],
  );

  function loadDemo() {
    setHeads(demoRows());
    setFromDemo(true);
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {planId ? <input type="hidden" name="planId" value={planId} /> : null}
      <input type="hidden" name="headsJson" value={headsJson} />
      {fromDemo ? <input type="hidden" name="fromDemo" value="1" /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor={`name-${planId ?? "new"}`} className="text-sm font-medium">
            Plan name
          </label>
          <Input
            id={`name-${planId ?? "new"}`}
            name="name"
            required
            defaultValue={defaultName}
            disabled={pending}
            className="h-11"
            placeholder="Class 1 — 2026-27"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`classLabel-${planId ?? "new"}`}
            className="text-sm font-medium"
          >
            Class label
          </label>
          <Input
            id={`classLabel-${planId ?? "new"}`}
            name="classLabel"
            defaultValue={defaultClassLabel}
            disabled={pending}
            className="h-11"
            placeholder="Class 1"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={`paymentMode-${planId ?? "new"}`}
          className="text-sm font-medium"
        >
          Payment mode
        </label>
        <select
          id={`paymentMode-${planId ?? "new"}`}
          name="paymentMode"
          required
          disabled={pending}
          defaultValue={defaultPaymentMode}
          className="border-input bg-background h-11 rounded-md border px-3 text-sm"
        >
          <option value="once">At once</option>
          <option value="quarterly">Quarterly (3 months)</option>
          <option value="custom">Custom heads</option>
        </select>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium">Fee heads</p>
            <p className="text-xs text-muted-foreground">
              Live total updates as you type. Publish writes a new version —
              families already billed stay on theirs.
            </p>
          </div>
          <p className="font-serif text-2xl font-semibold tracking-tight tabular-nums">
            {formatInr(totalAmountInr)}
          </p>
        </div>

        {fromDemo && !planId ? (
          <p className="bg-muted text-muted-foreground rounded-md px-3 py-2 text-xs">
            Demo starter — edit amounts, then publish to make this the school
            structure.
          </p>
        ) : null}

        <ul className="flex flex-col gap-3">
          {heads.map((head) => {
            const share =
              totalAmountInr > 0
                ? Math.min(
                    100,
                    Math.round((head.amountInr / totalAmountInr) * 100),
                  )
                : 0;
            return (
              <li key={head.id} className="flex flex-col gap-2">
                <div className="grid gap-2 sm:grid-cols-[1fr_8rem_auto]">
                  <Input
                    aria-label="Fee head name"
                    value={head.label}
                    disabled={pending}
                    className="h-11"
                    placeholder="Tuition"
                    onChange={(event) => {
                      const label = event.target.value;
                      setHeads((current) =>
                        current.map((row) =>
                          row.id === head.id ? { ...row, label } : row,
                        ),
                      );
                    }}
                  />
                  <Input
                    aria-label="Amount in rupees"
                    type="number"
                    min={0}
                    step={1}
                    value={head.amountInr}
                    disabled={pending}
                    className="h-11 tabular-nums"
                    onChange={(event) => {
                      const amountInr = Math.max(
                        0,
                        Math.floor(Number(event.target.value) || 0),
                      );
                      setHeads((current) =>
                        current.map((row) =>
                          row.id === head.id ? { ...row, amountInr } : row,
                        ),
                      );
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-11"
                    disabled={pending || heads.length <= 1}
                    onClick={() =>
                      setHeads((current) =>
                        current.filter((row) => row.id !== head.id),
                      )
                    }
                  >
                    Remove
                  </Button>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            disabled={pending}
            onClick={() => setHeads((current) => [...current, nextRow()])}
          >
            Add head
          </Button>
          {planId ? null : (
            <Button
              type="button"
              variant="outline"
              className="h-11"
              disabled={pending}
              onClick={loadDemo}
            >
              Load demo heads
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={`note-${planId ?? "new"}`} className="text-sm font-medium">
          Change note
        </label>
        <Input
          id={`note-${planId ?? "new"}`}
          name="note"
          disabled={pending}
          className="h-11"
          placeholder="Why this version changed"
        />
      </div>

      <Button type="submit" className="h-11 self-start" disabled={pending}>
        {pending ? <Spinner className="size-4" /> : null}
        Publish version
      </Button>
    </form>
  );
}
