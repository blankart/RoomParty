import { zodResolver } from "@hookform/resolvers/zod";
import type { UsersDTO } from "@RoomParty/trpc/dto";
import { UsersSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/trpc";
import Button from "@web/components/Button/Button";
import { InferMutationOutput, InferQueryOutput } from "@web/types/trpc";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsPlayCircleFill } from "react-icons/bs";
import { IoMdCloseCircle } from "react-icons/io";
import ReactCodeInput from "react-code-input";
import classNames from "classnames";
import numeral from "numeral";

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

  const context = trpc.useContext();

  useEffect(() => {
    setValue("email", props.verificationDetails.email);
  }, [props.verificationDetails.email]);

  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const [timer, setTimer] = useState<number>(
    props.verificationDetails.nextResendVerificationDate
      ? Math.max(
          0,
          (props.verificationDetails.nextResendVerificationDate.getTime() -
            Date.now()) /
            1_000
        )
      : 0
  );

  useEffect(() => {
    setTimer(
      props.verificationDetails.nextResendVerificationDate
        ? Math.max(
            0,
            (props.verificationDetails.nextResendVerificationDate.getTime() -
              Date.now()) /
              1_000
          )
        : 0
    );
  }, [props.verificationDetails.nextResendVerificationDate]);

  const { mutateAsync: confirmVerificationCode, isLoading } = trpc.useMutation([
    "users.confirmVerificationCode",
  ]);

  const { mutateAsync: resendVerificationCode } = trpc.useMutation([
    "users.resendVerificationCode",
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

  async function handleResend() {
    setErrorMessage(null);
    try {
      await resendVerificationCode({ email: props.verificationDetails.email });
      context.invalidateQueries(["users.getVerificationDetails"]);
    } catch (e) {
      setErrorMessage((e as any).message);
    }
  }

  useEffect(() => {
    let timeout: NodeJS.Timeout | undefined;
    if (timer > 0) {
      timeout = setTimeout(() => {
        setTimer((current) => Math.floor(current - 1));
      }, 1_000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [timer]);

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
              if (code.length === 6) {
                handleSubmit(onSubmit)();
              }
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
        <p>
          Did&apos;t receive the email?{" "}
          {timer > 0 ? (
            `Resend code after 
          ${numeral(timer).format("00:00:00")} minutes`
          ) : (
            <button
              type="button"
              className="link link-info"
              onClick={handleResend}
            >
              Resend code now
            </button>
          )}
        </p>
      </form>
    </>
  );
}
