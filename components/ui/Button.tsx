import { clsx } from "clsx";
import Link from "next/link";
import * as React from "react";

type Props =
  | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>);

export function Button(props: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium shadow-sm transition " +
    "focus:outline-none focus:ring-2 focus:ring-sage/40 disabled:opacity-50 disabled:pointer-events-none";
  const className = clsx(
    base,
    "bg-sage text-white hover:brightness-95",
    (props as any).className
  );

  if ("href" in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={className} {...(rest as any)} />
    );
  }

  const { ...rest } = props as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return <button className={className} {...rest} />;
}
