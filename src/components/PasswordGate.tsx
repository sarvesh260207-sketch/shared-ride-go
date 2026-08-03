import { useState, useEffect } from "react";

const PASSCODE = "6329";
const STORAGE_KEY = "zhoop_gate_ok";

const PasswordGate = ({ children }: { children: React.ReactNode }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "1") setUnlocked(true);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === PASSCODE) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <form onSubmit={submit} className="flex flex-col items-center gap-4">
        <input
          autoFocus
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={8}
          value={value}
          onChange={(e) => {
            setValue(e.target.value.replace(/\D/g, ""));
            setError(false);
          }}
          className="w-56 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none focus:border-white/60"
          aria-label="Enter access code"
        />
        {error && <p className="text-sm text-red-400">Incorrect code</p>}
        <button
          type="submit"
          className="rounded-xl border border-white/20 px-6 py-2 text-sm text-white hover:bg-white/10"
        >
          Enter
        </button>
      </form>
    </div>
  );
};

export default PasswordGate;
