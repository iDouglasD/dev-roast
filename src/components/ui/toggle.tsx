"use client";

import { Switch } from "@base-ui/react/switch";
import { type ComponentProps, forwardRef, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const toggleVariants = tv({
  base: "inline-flex items-center gap-3",
});

const trackVariants = tv({
  base: "flex h-toggle-track w-10 shrink-0 cursor-pointer items-center rounded-full p-toggle-pad transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-green focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page disabled:cursor-not-allowed disabled:opacity-50",
  variants: {
    checked: {
      true: "justify-end bg-accent-green",
      false: "justify-start bg-border-primary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

const thumbVariants = tv({
  base: "size-4 rounded-full transition-colors",
  variants: {
    checked: {
      true: "bg-bg-page",
      false: "bg-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

const labelVariants = tv({
  base: "font-mono text-xs transition-colors",
  variants: {
    checked: {
      true: "text-accent-green",
      false: "text-text-secondary",
    },
  },
  defaultVariants: {
    checked: false,
  },
});

type ToggleVariants = VariantProps<typeof toggleVariants>;

type ToggleProps = Omit<ComponentProps<"div">, "onChange"> &
  ToggleVariants & {
    checked?: boolean;
    defaultChecked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    name?: string;
  };

const Toggle = forwardRef<HTMLDivElement, ToggleProps>(
  (
    {
      className,
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      label,
      disabled,
      name,
      ...props
    },
    ref,
  ) => {
    const isControlled = controlledChecked !== undefined;
    const [internalChecked, setInternalChecked] = useState(defaultChecked);
    const isChecked = isControlled ? controlledChecked : internalChecked;

    const handleCheckedChange = (value: boolean) => {
      if (!isControlled) {
        setInternalChecked(value);
      }
      onCheckedChange?.(value);
    };

    return (
      <div ref={ref} className={toggleVariants({ className })} {...props}>
        <Switch.Root
          checked={isChecked}
          onCheckedChange={handleCheckedChange}
          disabled={disabled}
          name={name}
          render={(renderProps) => (
            <button
              {...renderProps}
              type="button"
              className={trackVariants({ checked: isChecked })}
            />
          )}
        >
          <Switch.Thumb
            render={(renderProps) => (
              <span
                {...renderProps}
                className={thumbVariants({ checked: isChecked })}
              />
            )}
          />
        </Switch.Root>
        {label && (
          <span className={labelVariants({ checked: isChecked })}>{label}</span>
        )}
      </div>
    );
  },
);

Toggle.displayName = "Toggle";

export { Toggle, toggleVariants, type ToggleProps };
