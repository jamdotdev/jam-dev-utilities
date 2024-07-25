import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  return (
    <header className="flex justify-between px-6 py-4">
      <div>Jam.dev</div>
      <ThemeToggle />
    </header>
  );
}
