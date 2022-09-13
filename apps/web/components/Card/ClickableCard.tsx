import classNames from "classnames";

interface ClickableCardProps {
  onClick?: (...args: any) => any;
  alt?: string;
  imgSrc?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function ClickableCard(props: ClickableCardProps) {
  return (
    <button
      className={classNames(
        "overflow-hidden rounded-lg bg-slate-700",
        props.className
      )}
      onClick={props.onClick}
    >
      {props.imgSrc ? (
        <img
          src={props.imgSrc}
          alt={props.alt}
          className="!m-0 aspect-video max-h-[150px] object-cover !w-full"
        />
      ) : (
        <div className="!m-0 aspect-video max-h-[150px] bg-slate-800/50 object-cover !w-full" />
      )}
      <div className="p-4">{props.children}</div>
    </button>
  );
}
