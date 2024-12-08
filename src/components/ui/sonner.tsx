import React from 'react';
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster: React.FC<ToasterProps> = (props) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          // Custom classes for success and error toasts
          success: "bg-green-100 text-green-600 border border-green-400", // Background, text, and border colors for success
          error: "bg-red-100 text-red-600 border border-red-400", // Background, text, and border colors for error
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
