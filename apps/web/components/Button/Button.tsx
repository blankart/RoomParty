import { Size } from "@web/types";
import classNames from "classnames";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  size?: Size;
  fullWidth?: boolean;
}

export default function Button({
  size = "md",
  fullWidth,
  ...props
}: ButtonProps) {
  {
    return (
      <button
        {...props}
        className={classNames(
          "bg-blue-600/40 px-4",
          props.className,
          size === "sm"
            ? "text-sm py-1"
            : size === "md"
            ? "text-md py-2"
            : size === "lg"
            ? "text-lg py-3"
            : "text-xl py-4",
          fullWidth ? "w-full" : undefined
        )}
      />
    );
  }
}
