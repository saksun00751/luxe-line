"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { LoadingOverlay } from "@/components/loading-overlay";
import { Button } from "@/components/ui/button";

export function SubmitButton({ children, pendingText = "กำลังดำเนินการ…", ...props }: React.ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      {pending && <LoadingOverlay label={pendingText} />}
      <Button type="submit" size="lg" disabled={pending || props.disabled} aria-busy={pending} {...props}>
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> {pendingText}
          </>
        ) : (
          children
        )}
      </Button>
    </>
  );
}
