import { SearchIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";

export function SearchBar() {
  return (
    <div className="hidden min-w-0 flex-1 md:mx-auto md:block md:max-w-md">
      <InputGroup className="h-10 border-transparent bg-muted/60 shadow-none transition-colors focus-within:border-input focus-within:bg-background">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          disabled
          readOnly
          aria-label="Search workspace (coming soon)"
          placeholder="Search people, classes, reports…"
          className="bg-transparent"
        />
        <InputGroupAddon align="inline-end">
          <kbd className="pointer-events-none inline-flex h-5 items-center rounded border border-border bg-background px-1.5 font-sans text-[11px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}

/** Compact search affordance on small screens. */
export function SearchBarMobile() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10 md:hidden"
      disabled
      aria-label="Search workspace (coming soon)"
    >
      <SearchIcon />
    </Button>
  );
}
