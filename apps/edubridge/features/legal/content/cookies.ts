import { PLATFORM_NAME } from "@/lib/brand";
import {
  COOKIES_VERSION,
  LEGAL_DOCS_IN_FORCE,
  operatorParty,
} from "@/lib/legal/constants";
import { COOKIE_INVENTORY } from "@/lib/legal/cookie-inventory";
import type { LegalSection } from "./terms";

function statusLine(): string {
  if (LEGAL_DOCS_IN_FORCE) {
    return `This Cookie Policy (version ${COOKIES_VERSION}) explains storage ${operatorParty()} uses on ${PLATFORM_NAME}.`;
  }
  return `This Cookie Policy (version ${COOKIES_VERSION}) is a draft. It is not in force until the operator is named and the document is marked in force.`;
}

export const COOKIES_TITLE = "Cookie Policy";

export const COOKIES_INTRO = `${statusLine()} You can choose Necessary only or Accept all. Until ${PLATFORM_NAME} adds analytics or advertising pixels, those two choices set the same cookies. We will not pretend advertising cookies exist today. “Remember me” on staff sign-in is a separate box and writes to localStorage only if you tick it.`;

export const COOKIES_SECTIONS: LegalSection[] = [
  {
    id: "necessary",
    title: "Necessary storage",
    body: `Necessary cookies run the product: sign-in, family session, administrator impersonation, and remembering this cookie choice. The service cannot work without them.`,
  },
  {
    id: "optional",
    title: "Optional storage",
    body: `Optional items are listed in the table below. Accept all will cover future optional cookies (for example analytics) when they are added to the inventory before they ship. Today Accept all does not enable extra pixels.`,
  },
  {
    id: "change",
    title: "How to change your choice",
    body: `Use Cookie preferences in the site footer, or clear site cookies for this host in your browser. Changing the choice does not log you out of a necessary session by itself.`,
  },
];

export const COOKIE_ROWS = COOKIE_INVENTORY;
