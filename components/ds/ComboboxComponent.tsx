"use client";
import React, { useState } from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./PopoverComponent";
import { Button } from "./ButtonComponent";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./CommandMenu";

interface ComboboxProps {
  data: { value: string; label: string }[];
  onSelect(value: string): void;
  defaultValue?: string;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(props.defaultValue || "");
  const selectedItem = props.data.find((item) => item.value === value);

  const setNewValue = (value: string) => {
    setValue(value);
    setOpen(false);
    props.onSelect(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          {selectedItem ? selectedItem.label : "Select base..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 h-auto">
        <Command>
          <CommandInput placeholder="Search base..." />
          <CommandList className="h-auto">
            <CommandEmpty>Base not found.</CommandEmpty>
            <CommandGroup>
              {props.data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => setNewValue(item.value)}
                >
                  {item.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
