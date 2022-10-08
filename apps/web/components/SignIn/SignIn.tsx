import { zodResolver } from "@hookform/resolvers/zod";
import type { UsersDTO } from "@RoomParty/trpc/dto";
import { UsersSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/api";
import { InferMutationOutput } from "@web/types/trpc";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsEye, BsEyeSlash, BsPlayCircleFill } from "react-icons/bs";
import { FaGoogle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import Button from "../Button/Button";
import Input from "../Input/Input";

interface SignInProps {
  onSuccess: (
    res: InferMutationOutput<"users.signIn">,
    data: UsersDTO.SignInSchema
  ) => any;
}

export default function SignIn(props: SignInProps) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm<UsersDTO.SignInSchema>({
    mode: "onSubmit",
    resolver: zodResolver(UsersSchema.signInSchema),
  });

  const { mutateAsync: login, isLoading } = trpc.useMutation(["users.signIn"]);

  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  async function onSubmit(data: UsersDTO.SignInSchema) {
    setErrorMessage(null);
    try {
      console.log("submit");
      const res = await login(data);
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
      <h1>Sign in</h1>
      <Button
        className="w-full !btn-outline"
        onClick={() => {
          (window as any).location =
            process.env.NEXT_PUBLIC_SERVER_URL + "/oauth2/redirect/google";
        }}
      >
        <FaGoogle className="mr-2" /> Sign in with Google
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

        <Button
          disabled={isLoading}
          loading={isLoading}
          className="w-full mt-4"
        >
          Sign in
        </Button>

        <p>
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" passHref>
            <a>Sign Up</a>
          </Link>
        </p>
      </form>
    </>
  );
}
