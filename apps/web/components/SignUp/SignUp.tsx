import { zodResolver } from "@hookform/resolvers/zod";
import type { UsersDTO } from "@RoomParty/trpc/dto";
import { UsersSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import { InferMutationOutput } from "@web/types/trpc";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsEye, BsEyeSlash, BsPlayCircleFill } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

interface SignUpProps {
  onSuccess: (
    res: InferMutationOutput<"users.signUp">,
    data: UsersDTO.RegisterSchema
  ) => any;
}

export default function SignUp(props: SignUpProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<UsersDTO.RegisterSchema>({
    mode: "onSubmit",
    resolver: zodResolver(UsersSchema.registerSchema),
  });

  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutateAsync: registerAccount, isLoading } = trpc.useMutation([
    "users.signUp",
  ]);

  async function onSubmit(data: UsersDTO.RegisterSchema) {
    setErrorMessage(null);
    try {
      const res = await registerAccount(data);
      props.onSuccess(res, data);
    } catch (e) {
      setErrorMessage((e as any).message);
    }
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <BsPlayCircleFill className="inline mr-2" />
      RoomParty
      <h1>Sign Up</h1>
      <Button
        className="w-full !btn-outline"
        onClick={() => {
          (window as any).location =
            process.env.NEXT_PUBLIC_SERVER_URL + "/oauth2/redirect/google";
        }}
      >
        <FaGoogle className="mr-2" /> Sign Up with Google
      </Button>
      <div className="w-full divider divider-vertical">OR</div>
      <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
        {!!errorMessage && (
          <div className="mb-2 text-sm shadow-lg alert alert-error">
            <div>
              <IoMdCloseCircle />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}
        <Input
          label="Email"
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="form-control">
          <div className="relative flex items-center input-group">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              error={errors.password?.message}
              wrapperClassName="w-full"
            />
            <div
              role="button"
              className="absolute right-0 btn btn-info btn-sm md:btn-md"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <BsEyeSlash /> : <BsEye />}
            </div>
          </div>
        </div>
        <Input
          label="Confirm Password"
          type="password"
          {...register("password2")}
          error={errors.password2?.message}
        />
        <div>
          <input
            type="checkbox"
            className="inline-block checkbox checkbox-info"
            {...register("agreeToTermsAndConditions")}
          />
          <span className="inline-block ml-4 mr-1 break-words">
            I agree to RoomParty&apos;s{" "}
          </span>
          <Link href="/teerms-and-conditions" passHref>
            <a className="break-words link">Terms and Conditions</a>
          </Link>
        </div>
        <small
          className={classNames("duration-100 text-error", {
            "opacity-0": !errors.agreeToTermsAndConditions?.message,
          })}
        >
          {errors.agreeToTermsAndConditions?.message ?? "Error Placeholder"}
        </small>
        <Button
          disabled={isLoading}
          loading={isLoading}
          className="w-full mt-4"
        >
          Sign Up
        </Button>
      </form>
    </>
  );
}
