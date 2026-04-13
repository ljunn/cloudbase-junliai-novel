import { useEffect, useRef, useState } from "react";

export type AutosaveState = "idle" | "saving" | "saved" | "error";

export const useAutosave = <T,>({
  value,
  enabled,
  delay = 800,
  onSave,
}: {
  value: T;
  enabled: boolean;
  delay?: number;
  onSave: (value: T) => Promise<void>;
}) => {
  const [state, setState] = useState<AutosaveState>("idle");
  const [error, setError] = useState("");
  const isFirstRender = useRef(true);
  const previousSerializedValue = useRef(JSON.stringify(value));
  const serializedValue = JSON.stringify(value);

  useEffect(() => {
    if (!enabled) {
      previousSerializedValue.current = serializedValue;
      return;
    }

    if (previousSerializedValue.current === serializedValue) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousSerializedValue.current = serializedValue;
      return;
    }

    previousSerializedValue.current = serializedValue;
    setState("saving");
    setError("");

    const timeoutId = window.setTimeout(() => {
      void onSave(value)
        .then(() => {
          setState("saved");
        })
        .catch((saveError) => {
          setState("error");
          setError(
            saveError instanceof Error ? saveError.message : "自动保存失败",
          );
        });
    }, delay);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delay, enabled, onSave, serializedValue, value]);

  return { state, error };
};
