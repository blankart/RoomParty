import { zodResolver } from "@hookform/resolvers/zod";
import type { UsersDTO } from "@RoomParty/trpc/dto";
import { UsersSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import classNames from "classnames";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsPlayCircleFill } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

export default function SignUpPage() {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<UsersDTO.RegisterSchema>({
    mode: "onSubmit",
    resolver: zodResolver(UsersSchema.registerSchema),
  });

  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const { mutateAsync: registerAccount } = trpc.useMutation(["users.register"]);

  async function onSubmit(data: UsersDTO.RegisterSchema) {
    setErrorMessage(null);
    try {
      await registerAccount(data);
    } catch (e) {
      setErrorMessage((e as any).message);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center w-full min-h-screen overflow-y-auto prose max-w-none">
        <div className="w-[min(500px,100%)] rounded-lg shadow-xl p-8 m-2">
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
            <Input
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
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
            <Button className="w-full mt-4">Sign Up</Button>
          </form>
        </div>
      </div>
    </>
  );
}
