interface ContainerProps {
  children?: React.ReactNode;
  className?: string;
}

import classNames from "classnames";

export default function Container(props: ContainerProps) {
  return (
    <div
      className={classNames(
        "w-full mx-auto prose dark:prose-invert min-h-screen dark:prose-invert relative",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}
