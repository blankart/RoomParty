interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}

import classNames from "classnames";

export default function Container(props: ContainerProps) {
  return (
    <div
      className={classNames(
        "w-full mx-auto prose min-h-screen dark:prose-invert relative max-w-none",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
