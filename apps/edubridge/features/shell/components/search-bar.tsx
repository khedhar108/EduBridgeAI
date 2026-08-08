import { SearchIcon } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";

export function SearchBar() {
  return (
    <div className="hidden min-w-0 flex-1 md:block md:max-w-xs lg:max-w-sm">
      <InputGroup className="h-11 bg-muted/40">
        <InputGroupAddon align="inline-start">
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          disabled
          readOnly
          aria-label="Search workspace (coming soon)"
          placeholder="Search workspace (soon)"
          className="bg-transparent"
        />
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
      className="size-11 md:hidden"
      disabled
      aria-label="Search workspace (coming soon)"
    >
      <SearchIcon />
    </Button>
  );
}
