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
  value?: string;
  disabled?: boolean;
}

export function Combobox(props: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedItem = props.data.find((item) => item.value === props.value);

  const setNewValue = (value: string) => {
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
          disabled={props.disabled}
        >
          {selectedItem ? selectedItem.label : "Select..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 h-auto">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList className="h-auto">
            <CommandEmpty>Nothing to see here.</CommandEmpty>
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
                      props.value === item.value ? "opacity-100" : "opacity-0"
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
