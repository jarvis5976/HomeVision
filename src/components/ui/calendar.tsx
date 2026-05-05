"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, UI, SelectionState, DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        [UI.Months]: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        [UI.Month]: "space-y-4",
        [UI.MonthCaption]: "flex justify-center pt-1 relative items-center h-9",
        [UI.CaptionLabel]: "text-sm font-medium",
        [UI.Nav]: "space-x-1 flex items-center",
        [UI.ButtonPrevious]: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1 z-10"
        ),
        [UI.ButtonNext]: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1 z-10"
        ),
        [UI.MonthGrid]: "w-full border-collapse space-y-1",
        [UI.Weekdays]: "flex w-full justify-between",
        [UI.Weekday]: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center flex-1",
        [UI.Week]: "flex w-full mt-2 justify-between",
        [UI.Day]: "h-9 w-9 p-0 font-normal relative flex items-center justify-center",
        [UI.DayButton]: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal transition-none",
          "aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:opacity-100",
          "data-[range-middle]:bg-accent data-[range-middle]:text-accent-foreground data-[range-middle]:rounded-none",
          "data-[range-start]:rounded-l-md data-[range-end]:rounded-r-md",
          "hover:bg-accent hover:text-accent-foreground"
        ),
        [UI.Today]: "bg-accent/50 text-accent-foreground font-bold",
        [UI.DayOutside]: "text-muted-foreground opacity-30 aria-selected:opacity-30",
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
