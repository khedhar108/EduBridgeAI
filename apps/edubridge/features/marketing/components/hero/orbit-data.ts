import { MARKETING_MODULES, type MarketingModule } from "../../content/modules";

export type OrbitRing = {
  id: number;
  /** Orbit radius in vmin units (scaled to the stage). */
  radius: number;
  /** Seconds for one full rotation. */
  duration: number;
  /** 1 = clockwise, -1 = counter-clockwise. */
  direction: 1 | -1;
};

export type OrbitSlot = {
  module: MarketingModule;
  ring: number;
  /** Initial position angle in degrees. */
  angle: number;
};

/**
 * Three concentric rings. Outer is slow; inner is faster — reads as
 * deeper modules pulled closer to the well. Directions alternate for depth.
 */
export const ORBIT_RINGS: readonly OrbitRing[] = [
  { id: 0, radius: 30, duration: 48, direction: 1 },
  { id: 1, radius: 21, duration: 36, direction: -1 },
  { id: 2, radius: 13, duration: 26, direction: 1 },
];

/** Resolve a marketing module by id, failing loud if content drifts. */
function pick(id: string): MarketingModule {
  const mod = MARKETING_MODULES.find((m) => m.id === id);
  if (!mod) throw new Error(`Orbit data references unknown module: ${id}`);
  return mod;
}

/**
 * Distribute the 7 marketing modules across the rings.
 * Angles within a ring are spaced so chips never overlap across rings.
 */
export const ORBIT_SLOTS: readonly OrbitSlot[] = [
  { module: pick("student-dashboard"), ring: 0, angle: 0 },
  { module: pick("report-card-designer"), ring: 0, angle: 120 },
  { module: pick("fee-structure"), ring: 0, angle: 240 },
  { module: pick("ai-assist"), ring: 1, angle: 60 },
  { module: pick("test-paper-creator"), ring: 1, angle: 240 },
  { module: pick("timetable-maker"), ring: 2, angle: 150 },
  { module: pick("receipt-creation"), ring: 2, angle: 330 },
];

export function slotsForRing(ringId: number): readonly OrbitSlot[] {
  return ORBIT_SLOTS.filter((s) => s.ring === ringId);
}
