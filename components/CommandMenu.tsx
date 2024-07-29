"use client";
import { useRouter } from "next/router";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ds/CommandMenu";
import { tools } from "./tools-list";
import { Input } from "./ds/InputComponent";
import { useEffect, useState } from "react";

export function CMDK() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <section className="flex justify-center">
      <div className="relative max-w-[320px] w-full">
        <Input placeholder="Search" onFocus={() => setOpen(true)} />
        <div className="flex absolute top-[50%] right-[12px] text-sm text-muted-foreground translate-y-[-50%]">
          <div className="pointer-events-none inline-flex h-5 select-none items-center gap-1 border bg-background text-foreground px-1.5 py-1 text-xs rounded-md">
            CMD + K
          </div>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Tools">
            {tools.map((tool) => (
              <CommandItem
                key={tool.title}
                onSelect={() => router.push(tool.link)}
              >
                <span>{tool.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </section>
  );
}
