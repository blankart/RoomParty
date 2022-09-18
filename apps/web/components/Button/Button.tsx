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
}

export default function Button({ disabled, loading, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={classNames(
        "btn btn-secondary",
        disabled && "btn-disabled",
        props.className
      )}
    >
      {props.children} {loading && <FaSpinner className="ml-2 animate-spin" />}
    </button>
  );
}
