'use client';
import * as React from "react";
import { cn } from "@/lib/utils";

type TimestampMode = "datetime" | "date" | "time";

interface TimestampProps {
  value: string;
  mode?: TimestampMode;
  className?: string;
}

const FORMATS: Record<TimestampMode, Intl.DateTimeFormatOptions> = {
  datetime: { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" },
  date: { year: "numeric", month: "short", day: "2-digit" },
  time: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
};

/**
 * Renders a stored ISO timestamp in the viewer's locale/timezone.
 *
 * Locale formatting is deliberately deferred until after mount: the server and
 * the browser resolve different timezones and locales, so formatting during the
 * first render produces a hydration mismatch. Until then the ISO date part is
 * shown, which is identical on both sides.
 */
export function Timestamp({ value, mode = "datetime", className }: TimestampProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Locale formatting is only safe once we are on the client.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const date = new Date(value);
  const isValid = !Number.isNaN(date.getTime());

  let text: string;
  if (!isValid) {
    text = "—";
  } else if (mounted) {
    text = date.toLocaleString(undefined, FORMATS[mode]);
  } else if (mode === "time") {
    text = value.slice(11, 19);
  } else {
    text = value.slice(0, 10);
  }

  return (
    <time dateTime={isValid ? date.toISOString() : undefined} className={cn(className)} suppressHydrationWarning>
      {text}
    </time>
  );
}
