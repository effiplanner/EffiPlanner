import { clsx } from "clsx";
import * as React from "react";

export function Chip({
  selected,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      {...props}
      className={clsx(
        "rounded-full border px-3 py-1 text-xs transition",
        selected
          ? "border-sage bg-sage/10 text-sage"
          : "border-black/10 bg-white hover:bg-black/5",
        props.className
      )}
    />
  );
}
