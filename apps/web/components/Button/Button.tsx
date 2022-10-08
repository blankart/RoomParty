import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { FaSpinner } from "react-icons/fa";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  loading?: boolean;
  disabled?: boolean;
  variant?: "info" | "none";
}

export default function Button({ disabled, loading, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        "btn",
        (!props.variant || props.variant === "info") && "btn-info",
        disabled && "btn-disabled",
        props.className
      )}
    >
      {props.children} {loading && <FaSpinner className="ml-2 animate-spin" />}
    </button>
  );
}
