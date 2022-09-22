import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import { useForm } from "react-hook-form";

export interface ChatNamePromptForm {
  name: string;
}

interface ChatNamePromptProps {
  onSetName: (data: ChatNamePromptForm) => any;
}

export default function ChatNamePrompt(props: ChatNamePromptProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChatNamePromptForm>({
    mode: "onSubmit",
  });

  return (
    <>
      <p className="!m-0 py-4 text-sm">
        Let me know your name so we can let you in!
      </p>
      <form onSubmit={handleSubmit(props.onSetName)}>
        <Input
          placeholder="Your name"
          className="input input-bordered input-primary"
          {...register("name", {
            required: "Name is required.",
            minLength: 3,
            maxLength: 15,
          })}
          error={errors.name?.message}
        />

        <Button className="w-full btn btn-sm">Let me in!</Button>
      </form>
    </>
  );
}
