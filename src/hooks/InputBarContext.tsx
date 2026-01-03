"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

type InputBarContextValue = {
  value: string;
  setValue: (v: string) => void;
  clear: () => void;
  focused: boolean;
  setFocused: (f: boolean) => void;
};

const InputBarContext = createContext<InputBarContextValue | undefined>(
  undefined
);

export const InputBarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [value, setValueState] = useState("");
  const [focused, setFocusedState] = useState(false);

  const setValue = useCallback((v: string) => setValueState(v), []);
  const setFocused = useCallback((f: boolean) => setFocusedState(f), []);
  const clear = useCallback(() => setValueState(""), []);

  const ctx = useMemo<InputBarContextValue>(
    () => ({
      value,
      setValue,
      clear,
      focused,
      setFocused,
    }),
    [value, setValue, clear, focused, setFocused]
  );

  return (
    <InputBarContext.Provider value={ctx}>{children}</InputBarContext.Provider>
  );
};

export function useInputBar(): InputBarContextValue {
  const ctx = useContext(InputBarContext);
  if (!ctx)
    throw new Error("useInputBar must be used within an InputBarProvider");
  return ctx;
}

export default InputBarProvider;
