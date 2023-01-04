import React from "react";
import "./Input.css";

interface InputProps extends React.HTMLProps<HTMLInputElement> {}

export function Input(props: InputProps) {
  return (
    <input {...props}/>
  );
}