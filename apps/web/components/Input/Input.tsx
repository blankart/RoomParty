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
  label?: string;
  wrapperClassName?: string;
}

function InputWithoutForwardedRef(
  props: InputProps,
  ref: ForwardedRef<HTMLInputElement>
) {
  const id = useId();
  return (
    <div className={classNames(props.wrapperClassName)}>
      {props.label && (
        <label htmlFor={"input-" + id} className="mb-1 text-sm">
          {props.label}
        </label>
      )}
      <input
        ref={ref}
        id={"input-" + id}
        {...props}
        className={classNames(
          "w-full input input-bordered input-primary duration-100",
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
