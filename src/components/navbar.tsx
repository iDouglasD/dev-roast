import Link from "next/link";
import type { ComponentProps } from "react";
import { tv } from "tailwind-variants";

const navbarVariants = tv({
  base: "flex h-14 items-center justify-between border-b border-border-primary bg-bg-page px-10",
});

type NavbarProps = ComponentProps<"nav">;

function Navbar({ className, ...props }: NavbarProps) {
  return (
    <nav className={navbarVariants({ className })} {...props}>
      <Link href="/" className="flex items-center gap-2">
        <span className="font-mono text-xl font-bold text-accent-green">
          {">"}
        </span>
        <span className="font-mono text-lg font-medium text-text-primary">
          devroast
        </span>
      </Link>
      <Link
        href="/leaderboard"
        className="font-mono text-code text-text-secondary transition-colors hover:text-text-primary"
      >
        leaderboard
      </Link>
    </nav>
  );
}

export { Navbar, navbarVariants, type NavbarProps };
