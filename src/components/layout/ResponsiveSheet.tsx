import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from "@/components/ui/drawer";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentClassName?: string;
}

export const ResponsiveSheet: React.FC<ResponsiveSheetProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  contentClassName,
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange} shouldScaleBackground={false}>
        <DrawerContent className="max-h-[85dvh] rounded-t-3xl border-none bg-white pb-safe shadow-xl">
          <div className="flex h-full flex-col overflow-hidden">
            <header className="sticky top-0 z-10 border-b border-muted/60 bg-white px-4 pt-3 pb-2">
              <div className="mx-auto h-1 w-10 rounded-full bg-muted" />
              <div className="mt-2 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                  {description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                  ) : null}
                </div>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="-mr-1 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/60"
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </DrawerClose>
              </div>
            </header>
            <div className={cn("flex-1 overflow-y-auto px-4 pb-28 pt-3", contentClassName)}>
              {children}
            </div>
            {footer ? (
              <footer className="border-t border-muted/60 bg-white px-4 pb-safe pt-3">
                {footer}
              </footer>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm text-muted-foreground">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className={cn("space-y-4", contentClassName)}>{children}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
};

