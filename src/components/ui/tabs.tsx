import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const gradientClasses = {
  current: 'bg-gradient-to-r from-green-400 to-green-600',
  upcoming: 'bg-gradient-to-r from-blue-400 to-blue-600',
  past: 'bg-gradient-to-r from-gray-400 to-gray-600',
  draft: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
};

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex justify-center w-full rounded-xl bg-muted text-muted-foreground gap-x-2 px-2',
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, ...props }, ref) => {
  const gradient = gradientClasses[value as keyof typeof gradientClasses] || 'bg-gradient-to-r from-gray-300 to-gray-500';
  const [isActive, setIsActive] = React.useState(false);
  const localRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    const el = (ref && typeof ref !== 'function' ? ref.current : localRef.current) as HTMLElement | null;
    if (!el) return;
    const observer = new MutationObserver(() => {
      setIsActive(el.getAttribute('data-state') === 'active');
    });
    observer.observe(el, { attributes: true, attributeFilter: ['data-state'] });
    setIsActive(el.getAttribute('data-state') === 'active');
    return () => observer.disconnect();
  }, [ref]);
  return (
    <TabsPrimitive.Trigger
      ref={node => {
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<any>).current = node;
        localRef.current = node;
      }}
      value={value}
      className={cn(
        'inline-flex h-12 items-center justify-center rounded-full px-6 py-0 text-base font-semibold transition-all duration-200',
        'bg-zinc-800 opacity-60 text-white',
        isActive ? `${gradient} opacity-100 text-white` : '',
        className
      )}
      style={{ borderRadius: 9999 }}
      {...props}
    />
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
