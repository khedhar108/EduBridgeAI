"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarDaysIcon,
  ClipboardListIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ReceiptIcon,
  SparklesIcon,
  WalletIcon,
} from "lucide-react";
import type { ModuleIconName } from "../types";

/** Client-only icon map — keeps ModulePage props RSC-safe. */
export const MODULE_ICONS: Record<ModuleIconName, LucideIcon> = {
  "layout-dashboard": LayoutDashboardIcon,
  sparkles: SparklesIcon,
  "calendar-days": CalendarDaysIcon,
  "clipboard-list": ClipboardListIcon,
  wallet: WalletIcon,
  receipt: ReceiptIcon,
  "file-text": FileTextIcon,
};

export function getModuleIcon(name: ModuleIconName): LucideIcon {
  return MODULE_ICONS[name];
}
