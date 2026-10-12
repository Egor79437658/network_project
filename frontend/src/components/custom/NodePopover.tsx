import { Button } from "@shadcnComponents/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@shadcnComponents/popover";
import { PenLine } from "lucide-react";
import { FC, ReactNode } from "react";

export const NodePopover: FC<{ children: ReactNode, className?: string }> = ({ children, className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-6 left-1/2 -translate-x-1/2"
        >
          <PenLine />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={className}>{children}</PopoverContent>
    </Popover>
  );
};
