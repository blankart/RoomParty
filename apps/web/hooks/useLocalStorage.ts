import { useEffect, useRef, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue?: T) {
  function getInitialValue() {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  }
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  const keyRef = useRef<string>(key);

  function setValue(value: T | ((newValue: T) => T)) {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (keyRef.current === key) return;
    setStoredValue(getInitialValue());
    keyRef.current = key;
  }, [key]);

  return [storedValue, setValue] as const;
}
