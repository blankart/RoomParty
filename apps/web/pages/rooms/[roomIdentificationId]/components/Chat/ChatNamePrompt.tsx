import { ACCESS_TOKEN_KEY } from "@RoomParty/shared-lib";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import Modal from "@web/components/Modal/Modal";
import { useMe } from "@web/context/AuthContext";
import { useForm } from "react-hook-form";
import { setCookie } from "nookies";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Router, useRouter } from "next/router";

const SignIn = dynamic(() => import("@web/components/SignIn/SignIn"), {
  ssr: false,
});
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

  const router = useRouter();

  const [openLoginModal, setOpenLoginModal] = useState(false);

  return (
    <>
      <Button
        type="button"
        className="w-full mb-4 btn btn-sm btn-outline"
        onClick={() => setOpenLoginModal(true)}
      >
        Sign in with existing account
      </Button>

      <Modal
        open={openLoginModal}
        onClose={() => {
          setOpenLoginModal(false);
        }}
        showCloseButton
        closeOnClickOutside
      >
        <SignIn
          onSuccess={(res) => {
            setCookie(null, ACCESS_TOKEN_KEY, res, { path: "/" });
            router.reload();
          }}
        />
      </Modal>

      <div className="divider divider-vertical">OR</div>
      <p className="!m-0 py-4 text-sm">
        Let me know your name so we can let you in!
      </p>

      <form onSubmit={handleSubmit(props.onSetName)}>
        <Input
          placeholder="Your name"
          className="input input-bordered input-info"
          {...register("name", {
            required: "Name is required.",
            minLength: 3,
            maxLength: 15,
          })}
          error={errors.name?.message}
        />

        <Button className="w-full btn btn-sm" aria-label="Let me in">
          Let me in!
        </Button>
      </form>
    </>
  );
}
