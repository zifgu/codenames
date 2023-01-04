import React, {forwardRef} from "react";
import "./Button.css";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  variant?: "red" | "blue" | "gray";
  small?: boolean,
  pushed?: boolean,
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({children, variant, small, pushed, ...props}: ButtonProps, ref) => {
  const variantClass = variant ? variant : "";
  const sizeClass = small ? "sm" : "";
  const pushedClass = pushed ? "selected" : "";
  return (
    <button
      ref={ref}
      {...props}
      type="button"
      className={`${props.className} ${variantClass} ${sizeClass} ${pushedClass}`}
    >
      <span className="front">
        {children}
      </span>
    </button>
  );
});
