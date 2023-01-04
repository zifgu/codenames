import React, {forwardRef} from "react";
import "./Button.css";

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: "red" | "blue" | "gray" | "light" | "dark";
  sizeVariant?: "sm" | "lg",
  pushed?: boolean,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({children, variant, sizeVariant, pushed, ...props}: ButtonProps, ref) => {
  const variantClass = variant ? ` ${variant}` : "";
  const sizeClass = sizeVariant ? ` ${sizeVariant}` : "";
  const pushedClass = pushed ? " selected" : "";
  const existingClasses = props.className ? ` ${props.className}` : "";
  return (
    <button
      ref={ref}
      {...props}
      className={`push-button${variantClass}${sizeClass}${pushedClass}${existingClasses}`}
    >
      <span className="front">
        {children}
      </span>
    </button>
  );
});
