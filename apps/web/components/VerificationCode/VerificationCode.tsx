import { zodResolver } from "@hookform/resolvers/zod";
import type { UsersDTO } from "@RoomParty/trpc/dto";
import { UsersSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import { InferMutationOutput, InferQueryOutput } from "@web/types/trpc";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsPlayCircleFill } from "react-icons/bs";
import { IoMdCloseCircle } from "react-icons/io";
import ReactCodeInput from "react-code-input";
import classNames from "classnames";

interface VerificationCodeProps {
  onSuccess: (
    res: InferMutationOutput<"users.confirmVerificationCode">,
    data: UsersDTO.ConfirmVerificationCodeSchema
  ) => any;
  verificationDetails: InferQueryOutput<"users.getVerificationDetails">;
}

export default function VerificationCode(props: VerificationCodeProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<UsersDTO.ConfirmVerificationCodeSchema>({
    mode: "all",
    resolver: zodResolver(UsersSchema.confirmVerificationCodeSchema),
  });

  useEffect(() => {
    setValue("email", props.verificationDetails.email);
  }, [props.verificationDetails.email]);

  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutateAsync: confirmVerificationCode, isLoading } = trpc.useMutation([
    "users.confirmVerificationCode",
  ]);

  async function onSubmit(data: UsersDTO.ConfirmVerificationCodeSchema) {
    setErrorMessage(null);
    try {
      const res = await confirmVerificationCode(data);
      props.onSuccess(res, data);
    } catch (e) {
      setErrorMessage((e as any).message);
    }
  }

  return (
    <>
      <BsPlayCircleFill className="inline mr-2" />
      RoomParty
      <h1>Enter Verification Code</h1>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        {!!errorMessage && (
          <div className="mb-2 text-sm shadow-lg alert alert-error">
            <div>
              <IoMdCloseCircle />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
        <h4 className="my-5">
          Enter verification your verification code that we sent through your
          e-mail ({props.verificationDetails.email})
        </h4>
        <div>
          <ReactCodeInput
            inputMode="numeric"
            {...register("code")}
            onChange={(code) => {
              setValue("code", code);
            }}
            type="number"
            fields={6}
            className={classNames("react-code-input", {
              error: !!errors.code?.message,
            })}
          />
        </div>

        <small
          className={classNames("duration-100 text-error", {
            "opacity-0": !errors.code?.message,
          })}
        >
          {errors.code?.message ?? "Error Placeholder"}
        </small>

        <Button
          disabled={isLoading}
          loading={isLoading}
          className="w-full mt-4"
        >
          Submit
        </Button>
      </form>
    </>
  );
}
