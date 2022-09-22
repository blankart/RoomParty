import { zodResolver } from "@hookform/resolvers/zod";
import { RoomsDTO } from "@rooms2watch/trpc/dto";
import { RoomsSchema } from "@rooms2watch/trpc/schema";
import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import classNames from "classnames";
import { reset } from "numeral";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { FaInfoCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";

interface RoomSettingsProps {
  id?: string;
}

export default function RoomSettings(props: RoomSettingsProps) {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data: roomSettings, isLoading: isGetSettingsLoading } = trpc.useQuery(
    ["rooms.getSettings", { id: props.id! }],
    {
      enabled: !!props.id,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );

  const { mutateAsync: saveSettings, isLoading } = trpc.useMutation(
    ["rooms.saveSettings"],
    {
      onSuccess(data) {
        setErrorMessage(null);
        setSuccessMessage(data);
        reset(watch());
      },
      onError(error) {
        setSuccessMessage(null);
        setErrorMessage(error.message);
      },
    }
  );

  const {
    handleSubmit,
    register,
    formState: { errors, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<RoomsDTO.SaveSettingsSchema>({
    resolver: zodResolver(RoomsSchema.saveSettingsSchema),
    mode: "onSubmit",
    defaultValues: {
      id: props.id,
    },
  });

  useEffect(() => {
    reset(roomSettings);
  }, [roomSettings]);

  useEffect(() => {
    if (!props.id) return;
    setValue("id", props.id);
  }, [props.id]);

  const isPrivate = watch("private");

  async function onSubmit(data: RoomsDTO.SaveSettingsSchema) {
    setErrorMessage(null);
    setSuccessMessage(null);
    await saveSettings(data);
  }

  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames("flex flex-col gap-2 form", {
        "opacity-80 pointer-events-none": isGetSettingsLoading,
      })}
    >
      {!!successMessage && (
        <div className="text-sm shadow-lg alert">
          <div className="w-full">
            <FaInfoCircle />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {!!errorMessage && (
        <div className="text-sm shadow-lg alert">
          <div>
            <IoMdCloseCircle />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="!m-0">Set room password</p>
        <Input
          type="checkbox"
          className="w-auto toggle toggle-primary toggle-sm"
          {...register("private")}
        />
      </div>
      <div className="form-control">
        <div className="input-group">
          <Input
            disabled={!isPrivate}
            type={showPassword ? "text" : "password"}
            placeholder="Set room password"
            error={errors?.password?.message}
            wrapperClassName="w-full"
            {...register("password")}
          />
          <div
            role="button"
            className={classNames(
              "btn btn-primary btn-ghost",
              !isPrivate && "btn-disabled"
            )}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </div>
        </div>
      </div>
      <Button
        type="submit"
        role="submit"
        loading={isLoading}
        disabled={isLoading || !isDirty}
      >
        Save Settings
      </Button>
    </form>
  );
}
