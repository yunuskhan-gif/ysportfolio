// src/components/ui/date-picker-time.tsx
"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";

interface DatePickerTimeProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  hasError?: boolean;
  placeholder?: string;
  hideTime?: boolean;
  className?: string;
}

export function DatePickerTime({
  date,
  setDate,
  hasError,
  placeholder = "Pick date",
  hideTime = false,
  className,
}: DatePickerTimeProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [isInputError, setIsInputError] = React.useState(false);
  const hourRef = React.useRef<HTMLDivElement>(null);
  const minuteRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const formatStr = hideTime ? "MM/dd/yyyy" : "MM/dd/yyyy HH:mm";

  // Sync input value when date prop changes
  React.useEffect(() => {
    // Only update the input text if the popover is closed (to avoid jumping while typing)
    // and if there's a valid date to show.
    if (date && !open) {
      setInputValue(format(date, formatStr));
      setIsInputError(false);
    } else if (!date && !open && inputValue !== "") {
      // If we closed but have an invalid/incomplete string, we keep it as is
      // unless we want to force clear it. For now, let's stay quiet.
    }
  }, [date, formatStr, open]);

  // Auto-scroll to selected time when opening
  React.useEffect(() => {
    if (open && !hideTime) {
      // Small delay to ensure the popover is rendered
      setTimeout(() => {
        if (hourRef.current) {
          const selectedHour = date ? date.getHours() : 9; // Default to 9 AM (Market Open)
          const hourElement = hourRef.current.querySelector(`[data-hour="${selectedHour}"]`);
          if (hourElement) {
            hourElement.scrollIntoView({ block: "start", behavior: "auto" });
          }
        }
        if (minuteRef.current) {
          const selectedMinute = date ? date.getMinutes() : 0;
          const minuteElement = minuteRef.current.querySelector(`[data-minute="${selectedMinute}"]`);
          if (minuteElement) {
            minuteElement.scrollIntoView({ block: "center", behavior: "auto" });
          }
        }
      }, 50);
    }
  }, [open, hideTime]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setDate(undefined);
      return;
    }

    const newDate = new Date(selectedDate);
    if (date) {
      newDate.setHours(date.getHours());
      newDate.setMinutes(date.getMinutes());
      newDate.setSeconds(date.getSeconds());
    } else {
      // Default to 09:15 (Market Open) if picking a date for the first time
      newDate.setHours(9);
      newDate.setMinutes(15);
      newDate.setSeconds(0);
    }

    setDate(newDate);
  };

  const handleTimeChange = (type: "hour" | "minute", value: string) => {
    const currentDate = date || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      newDate.setHours(parseInt(value, 10));
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }

    setDate(newDate);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value;

    // Auto-masking/formatting logic
    const numbers = v.replace(/\D/g, "");
    if (numbers.length <= 8) {
      // Date part
      let formatted = "";
      if (numbers.length > 0) formatted += numbers.substring(0, 2);
      if (numbers.length > 2) formatted += "/" + numbers.substring(2, 4);
      if (numbers.length > 4) formatted += "/" + numbers.substring(4, 8);
      v = formatted;
    } else if (!hideTime) {
      // Date + Time part
      let formatted = "";
      formatted += numbers.substring(0, 2);
      formatted += "/" + numbers.substring(2, 4);
      formatted += "/" + numbers.substring(4, 8);
      formatted += " " + numbers.substring(8, 10);
      if (numbers.length > 10) formatted += ":" + numbers.substring(10, 12);
      v = formatted;
    }

    setInputValue(v);

    // Attempt to parse
    if (v.length === formatStr.length) {
      const parsedDate = parse(v, formatStr, new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
        setIsInputError(false);
      } else {
        setIsInputError(true);
      }
    } else if (v.length === 0) {
      setDate(undefined);
      setIsInputError(false);
    } else {
      setIsInputError(v.length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parsedDate = parse(inputValue, formatStr, new Date());
      if (isValid(parsedDate)) {
        setDate(parsedDate);
        setIsInputError(false);
        setOpen(false);
      } else {
        setIsInputError(true);
      }
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <div ref={containerRef} className="relative w-full group">
          {inputValue && (
            <div className="absolute left-8 top-1/2 -translate-y-1/2 text-xs pointer-events-none select-none flex items-center">
              <span className="opacity-0 whitespace-pre">{inputValue}</span>
              <span className="text-muted-foreground/30">
                {formatStr.toUpperCase().substring(inputValue.length)}
              </span>
            </div>
          )}
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full h-8 pl-8 pr-2 text-xs bg-background transition-shadow placeholder:text-muted-foreground/30",
              className,
              (isInputError || hasError) && "border-destructive ring-destructive focus-visible:ring-destructive",
            )}
            onFocus={() => !open && setOpen(true)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
          </Button>
        </div>
      </PopoverAnchor>
      <PopoverContent
        className="w-auto p-0 z-[9999] overflow-hidden rounded-xl shadow-2xl border-border/50 bg-popover/95 backdrop-blur-sm"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => {
          if (containerRef.current?.contains(e.target as Node)) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex flex-col sm:flex-row">
          <div className="p-1">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              className="rounded-md"
            />
            {!hideTime && (
              <div className="px-3 pb-3 sm:hidden">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => setDate(new Date())}
                >
                  Set to Now
                </Button>
              </div>
            )}
          </div>
          
          {!hideTime && (
            <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-border/50 bg-muted/5 w-full sm:w-[130px]">
              
              <div className="flex flex-row h-[280px] divide-x divide-border/50">
                <div 
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="text-[9px] font-medium text-center py-1 text-muted-foreground/60 border-b border-border/50 bg-muted/10">Hrs</div>
                  <div 
                    ref={hourRef}
                    className="flex-1 overflow-y-auto scrollbar-hide py-1 px-1.5"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-0.5">
                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                        <Button
                          key={hour}
                          data-hour={hour}
                          size="sm"
                          variant={
                            date && date.getHours() === hour ? "default" : "ghost"
                          }
                          className={cn(
                            "w-full h-7 text-xs font-medium rounded-md transition-all",
                            date && date.getHours() === hour 
                              ? "shadow-sm scale-105 z-10" 
                              : "hover:bg-primary/5 hover:text-primary"
                          )}
                          onClick={() => handleTimeChange("hour", hour.toString())}
                        >
                          {hour.toString().padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div 
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <div className="text-[9px] font-medium text-center py-1 text-muted-foreground/60 border-b border-border/50 bg-muted/10">Min</div>
                  <div 
                    ref={minuteRef}
                    className="flex-1 overflow-y-auto scrollbar-hide py-1 px-1.5"
                    onWheel={(e) => e.stopPropagation()}
                  >
                    <div className="flex flex-col gap-0.5">
                      {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
                        <Button
                          key={minute}
                          data-minute={minute}
                          size="sm"
                          variant={
                            date && date.getMinutes() === minute ? "default" : "ghost"
                          }
                          className={cn(
                            "w-full h-7 text-xs font-medium rounded-md transition-all",
                            date && date.getMinutes() === minute 
                              ? "shadow-sm scale-105 z-10" 
                              : "hover:bg-primary/5 hover:text-primary"
                          )}
                          onClick={() =>
                            handleTimeChange("minute", minute.toString())
                          }
                        >
                          {minute.toString().padStart(2, "0")}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
