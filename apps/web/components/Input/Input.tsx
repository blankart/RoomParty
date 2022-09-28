import classNames from "classnames";
import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  useId,
} from "react";

interface InputProps
  extends DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {
  error?: string;
  label?: string | React.ReactNode;
  wrapperClassName?: string;
}

function InputWithoutForwardedRef(
  { wrapperClassName, ...props }: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const id = useId();
  return (
    <div className={classNames(wrapperClassName)}>
      {props.label && (
        <label
          htmlFor={"input-" + id}
          className={classNames("mb-1 text-sm", props.disabled && "opacity-60")}
        >
          {props.label}
        </label>
      )}
      <input
        ref={ref}
        id={"input-" + id}
        {...props}
        className={classNames(
          "w-full input input-sm lg:input-md input-bordered input-info duration-100",
          props.className,
          {
            "input-error": !!props.error,
          }
        )}
      />
      <small
        className={classNames("duration-100 text-error", {
          "opacity-0": !props.error,
        })}
      >
        {props.error ?? "Error Placeholder"}
      </small>
    </div>
  );
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  InputWithoutForwardedRef
);

export default Input;
