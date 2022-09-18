interface BaseCardProps {
  children?: React.ReactNode;
}

export default function BaseCard(props: BaseCardProps) {
  return (
    <div className="card w-full md:w-[min(400px,100%)] min-h-[200px] shadow-lg bg-base-100 m-4">
      {props.children}
    </div>
  );
}
