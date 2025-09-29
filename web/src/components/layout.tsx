import type { HTMLAttributes } from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Section({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cx("py-12 sm:py-16 lg:py-24", className)} {...props} />;
}

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx("mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
