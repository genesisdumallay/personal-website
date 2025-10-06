"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type InputBarContextValue = {
  value: string;
  setValue: (v: string) => void;
  clear: () => void;
  focused: boolean;
  setFocused: (f: boolean) => void;
};

const InputBarContext = createContext<InputBarContextValue | undefined>(undefined);

export const InputBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const clear = useCallback(() => setValue(""), []);

  const ctx: InputBarContextValue = {
    value,
    setValue,
    clear,
    focused,
    setFocused,
  };

  return <InputBarContext.Provider value={ctx}>{children}</InputBarContext.Provider>;
};

export function useInputBar(): InputBarContextValue {
  const ctx = useContext(InputBarContext);
  if (!ctx) throw new Error("useInputBar must be used within an InputBarProvider");
  return ctx;
}

export default InputBarProvider;
