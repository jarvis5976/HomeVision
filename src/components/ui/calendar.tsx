"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, UI } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-card", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center h-9 mb-4",
        [UI.CaptionLabel]: "text-sm font-bold uppercase tracking-widest",
        [UI.Nav]: "space-x-1 flex items-center",
        [UI.ButtonPrevious]: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10"
        ),
        [UI.ButtonNext]: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10"
        ),
        [UI.MonthGrid]: "w-full border-collapse select-none",
        [UI.Weekdays]: "flex mb-2",
        [UI.Weekday]: "text-muted-foreground w-9 font-black text-[10px] text-center uppercase flex-1",
        [UI.Week]: "flex w-full mt-0.5",
        [UI.Day]: "relative h-9 w-9 p-0 text-center text-sm focus-within:relative focus-within:z-20 flex-1 flex items-center justify-center",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal transition-all duration-200 border-none",
          "hover:bg-primary/20 hover:text-primary",
          // Style pour les jours sélectionnés (bornes ou simple)
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100 aria-selected:font-bold",
          // Style pour l'intervalle de sélection (middle)
          "data-[range-middle]:bg-primary/20 data-[range-middle]:text-primary data-[range-middle]:rounded-none",
          "data-[range-start]:rounded-l-md data-[range-end]:rounded-r-md"
        ),
        [UI.Today]: "text-primary font-black underline underline-offset-4",
        [UI.DayOutside]: "text-muted-foreground opacity-20 aria-selected:opacity-30",
        [UI.DayDisabled]: "text-muted-foreground opacity-50",
        [UI.DayHidden]: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
