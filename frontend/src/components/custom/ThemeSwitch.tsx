import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Kbd, KbdGroup } from "@shadcnComponents/kbd"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shadcnComponents/tooltip"
import { Moon, Sun } from "lucide-react"
import type { FC } from "react"

export const ThemeSwitch: FC = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <div
            className={cn(
              "relative h-[1.2rem] w-[1.2rem]",
              "transition-transform duration-1000 ease-in-out",
              "dark:rotate-360"
            )}
          >
            <Sun
              className={cn(
                "absolute h-full w-full",
                "scale-100 rotate-0 transition-all duration-300",
                "dark:scale-0 dark:-rotate-90"
              )}
            />
            <Moon
              className={cn(
                "absolute h-full w-full",
                "scale-0 rotate-180 transition-all duration-300",
                "dark:scale-100 dark:rotate-0"
              )}
            />
          </div>

          <span className="sr-only">Переключить тему</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
          <span>Переключить тему</span>
          <KbdGroup>
            <Kbd>Alt</Kbd>
            <span>+</span>
            <Kbd>v</Kbd>
          </KbdGroup>
      </TooltipContent>
    </Tooltip>
  )
}
