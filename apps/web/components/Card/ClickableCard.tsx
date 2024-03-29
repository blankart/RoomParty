import classNames from "classnames";
import Link from "next/link";

interface ClickableCardProps {
  onClick?: (...args: any) => any;
  alt?: string;
  imgSrc?: string;
  className?: string;
  children?: React.ReactNode;
  href?: string;
  as?: string;
  shallow?: boolean;
}

export default function ClickableCard(props: ClickableCardProps) {
  const wrapperClassName = classNames(
    "overflow-hidden rounded-lg bg-base-200 duration-100 border-2 border-transparent hover:border-info flex md:block",
    props.className
  );
  let content = (
    <>
      {props.imgSrc ? (
        <img
          loading="lazy"
          src={props.imgSrc}
          alt={props.alt}
          className="!m-0 aspect-video h-full md:h-[150px] object-cover w-[40%] md:w-full"
        />
      ) : (
        <div className="!m-0 aspect-video max-h-[150px] bg-info object-cover !w-full" />
      )}
      <div className="p-4">{props.children}</div>
    </>
  );

  if (!props.href) {
    content = (
      <button
        aria-label={props.href}
        className={wrapperClassName}
        onClick={props.onClick}
      >
        {content}
      </button>
    );
  } else {
    content = (
      <Link href={props.href} as={props.as} passHref shallow={props.shallow}>
        <a className={classNames(wrapperClassName, "no-underline")}>
          {content}
        </a>
      </Link>
    );

    content = content;
  }

  return content;
}
