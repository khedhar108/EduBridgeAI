import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

/**
 * Free EduBridge local servers so `pnpm run dev` can start without a PC reboot.
 * Kills listeners on app ports only — not Cursor, not other projects.
 */
const PORTS = [3000, 3001, 3002, 4111, 4983];
const isWin = process.platform === "win32";
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function pidsListeningOn(port) {
  const pids = new Set();
  if (isWin) {
    const out = execFileSync("netstat", ["-ano"], { encoding: "utf8" });
    for (const raw of out.split(/\r?\n/)) {
      if (!/LISTENING/i.test(raw)) continue;
      const parts = raw.trim().split(/\s+/);
      const local = parts[1] ?? "";
      const pid = Number(parts.at(-1));
      if (!Number.isInteger(pid) || pid <= 4) continue;
      if (local.endsWith(`:${port}`) || local.includes(`]:${port}`)) {
        pids.add(pid);
      }
    }
    return [...pids];
  }

  const result = spawnSync(
    "lsof",
    ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"],
    { encoding: "utf8" },
  );
  for (const line of (result.stdout ?? "").split(/\r?\n/)) {
    const pid = Number(line.trim());
    if (Number.isInteger(pid) && pid > 1) pids.add(pid);
  }
  return [...pids];
}

function killPid(pid) {
  if (pid === process.pid || pid === process.ppid) return false;
  if (isWin) {
    const result = spawnSync(
      "taskkill",
      ["/PID", String(pid), "/T", "/F"],
      { encoding: "utf8" },
    );
    return result.status === 0;
  }
  try {
    process.kill(pid, "SIGTERM");
    return true;
  } catch {
    return false;
  }
}

function clearMastraLocks() {
  const mastraDir = path.join(repoRoot, "apps", "agent", ".mastra");
  if (!existsSync(mastraDir)) return [];
  const removed = [];
  const stack = [mastraDir];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      if (/\.(lock|pid)$/i.test(entry.name) || /dev-server/i.test(entry.name)) {
        rmSync(full, { force: true });
        removed.push(path.relative(repoRoot, full));
      }
    }
  }
  return removed;
}

const killed = [];
const missing = [];

for (const port of PORTS) {
  const pids = pidsListeningOn(port);
  if (pids.length === 0) {
    missing.push(port);
    continue;
  }
  for (const pid of pids) {
    const ok = killPid(pid);
    killed.push({ port, pid, ok });
  }
}

const locks = clearMastraLocks();

if (killed.length === 0 && locks.length === 0) {
  process.stdout.write(
    `No EduBridge servers on ${PORTS.join(", ")}. Safe to run pnpm run dev.\n`,
  );
  process.exit(0);
}

for (const item of killed) {
  process.stdout.write(
    item.ok
      ? `Stopped PID ${item.pid} on port ${item.port}\n`
      : `Could not stop PID ${item.pid} on port ${item.port}\n`,
  );
}
for (const file of locks) {
  process.stdout.write(`Removed lock ${file}\n`);
}

process.stdout.write("Done. Start again with: pnpm run dev\n");
