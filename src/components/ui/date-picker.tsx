
import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  id?: string
  onSelect?: (date: Date | undefined) => void
  selected?: Date
  placeholder?: string
  minDate?: Date
  maxDate?: Date
  disabledDate?: (date: Date) => boolean
  variant?: 'default' | 'compact'
}

export function DatePicker({ id, onSelect, selected, placeholder = "Pick a date", minDate, maxDate, disabledDate, variant = 'default' }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected)

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    onSelect?.(selectedDate)
  }

  // Compose disabledDate to enforce minDate/maxDate
  const composedDisabledDate = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (disabledDate && disabledDate(date)) return true;
    return false;
  };

  if (variant === 'compact') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            className="p-3 pointer-events-auto"
            disabled={composedDisabledDate}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
          className="p-3 pointer-events-auto"
          disabled={composedDisabledDate}
        />
      </PopoverContent>
    </Popover>
  )
}
