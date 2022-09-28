import { zodResolver } from "@hookform/resolvers/zod";
import { RoomsDTO } from "@RoomParty/trpc/dto";
import { RoomsSchema } from "@RoomParty/trpc/schema";
import { trpc } from "@web/api";
import Button from "@web/components/Button/Button";
import Input from "@web/components/Input/Input";
import classNames from "classnames";
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

  const context = trpc.useContext();

  const { mutateAsync: saveSettings, isLoading } = trpc.useMutation(
    ["rooms.saveSettings"],
    {
      onSuccess(data) {
        setErrorMessage(null);
        setSuccessMessage(data);
        reset(watch());
        context.invalidateQueries(["rooms.findByRoomIdentificationId"]);
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
      autoComplete="off"
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

      <div>
        <h4>Set a room password</h4>
        <p className="!m-0 text-sm opacity-90">
          Users will be asked to enter your password in order to join the room.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm md:text-md !m-0">Enabled?</p>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          {...register("private", {
            onChange(event) {
              if (!event.target.checked) setValue("password", undefined);
            },
          })}
        />
      </div>

      <div className="form-control">
        <div className="flex items-center input-group">
          <Input
            label="Enter your password"
            disabled={!isPrivate}
            type={showPassword ? "text" : "password"}
            placeholder="Set room password"
            error={errors?.password?.message}
            className="input-sm md:input-md"
            wrapperClassName="w-full"
            {...register("password")}
          />
          <div
            role="button"
            className={classNames(
              "btn btn-primary btn-ghost btn-sm md:btn-md",
              !isPrivate && "btn-disabled"
            )}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <BsEyeSlash /> : <BsEye />}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <p className="text-sm md:text-md !m-0 whitespace-nowrap">
          Allow everyone to control the player
        </p>
        <input
          type="checkbox"
          className="toggle toggle-primary toggle-sm"
          {...register("allowAccessToEveryone")}
        />
      </div>

      <Button
        aria-label="Save settings"
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
