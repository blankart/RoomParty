import classNames from "classnames";
import { useEffect, useId, useRef } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface ModalProps {
  onClose: () => any;
  open: boolean;
  children?: React.ReactNode;
  title?: string;
  bodyClassName?: string;
  containerClassName?: string;
  closeOnClickOutside?: boolean;
  showCloseButton?: boolean;
}

export default function Modal(props: ModalProps) {
  const id = useId();

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!props.closeOnClickOutside) return;
    const handler = (e: MouseEvent) => {
      if (e.target === modalRef.current) props.onClose();
    };

    window.addEventListener("mousedown", handler);

    return () => {
      window.removeEventListener("mousedown", handler);
    };
  }, []);
  return (
    <>
      <input type="checkbox" id={`modal-${id}`} className="modal-toggle" />
      {props.open && (
        <div
          ref={modalRef}
          className={classNames("modal", props.open && "modal-open")}
        >
          <div className={classNames("modal-box", props.containerClassName)}>
            {props.showCloseButton && (
              <button
                className="absolute top-2 right-2 md:top-4 md:right-4 btn btn-circle btn-ghost"
                onClick={props.onClose}
              >
                <IoMdCloseCircle className="w-5 h-auto" />
              </button>
            )}

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
