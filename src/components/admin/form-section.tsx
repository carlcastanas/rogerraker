import * as React from "react";
import { PanelHeader } from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export function FormSection({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("panel rounded-[2px]", className)}>
      <PanelHeader title={title} description={description} action={action} />
      <div className={cn("space-y-5 p-5", bodyClassName)}>{children}</div>
    </section>
  );
}
