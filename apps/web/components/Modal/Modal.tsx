import classNames from "classnames";
import { useId } from "react";

interface ModalProps {
  onClose: () => any;
  open: boolean;
  children?: React.ReactNode;
  title?: string;
  bodyClassName?: string;
  containerClassName?: string;
}

export default function Modal(props: ModalProps) {
  const id = useId();
  return (
    <>
      <input type="checkbox" id={`modal-${id}`} className="modal-toggle" />
      {props.open && (
        <div className={classNames("modal", props.open && "modal-open")}>
          <div className={classNames("modal-box", props.containerClassName)}>
            {!!props.title && (
              <h1 className="py-4 text-2xl font-bold text-center break-words">
                {props.title}
              </h1>
            )}
            <div className={props.bodyClassName}>{props.children}</div>
          </div>
        </div>
      )}
    </>
  );
}
