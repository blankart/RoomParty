import { useState } from "react";
import useDebouncedEffect, {
  DEFAULT_DEBOUNCED_TIME,
} from "./useDebouncedEffect";

export default function useDebouncedState<T extends any>(
  initialState: T,
  debouncedTime?: number
) {
  if (typeof debouncedTime !== "number") debouncedTime = DEFAULT_DEBOUNCED_TIME;

  const [value, setValue] = useState(initialState);
  const [debouncedValue, setDebouncedValue] = useState(value);

  useDebouncedEffect(
    () => {
      setDebouncedValue(value);
    },
    [value],
    debouncedTime
  );

  return [value, debouncedValue, setValue] as const;
}
