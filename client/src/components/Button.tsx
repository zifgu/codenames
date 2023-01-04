import React from "react";
import "./Button.css";

interface ButtonProps extends React.HTMLProps<HTMLButtonElement> {
  variant?: "red" | "blue" | "gray";
  small?: boolean,
  pushed?: boolean,
}

export function Button({children, variant, small, pushed, ...props}: ButtonProps) {
  const variantClass = variant ? variant : "";
  const sizeClass = small ? "sm" : "";
  const pushedClass = pushed ? "selected" : "";
  return (
    <button {...props} type="button" className={`${props.className} ${variantClass} ${sizeClass} ${pushedClass}`}>
      <span className="front">
        {children}
      </span>
    </button>
  );
}
