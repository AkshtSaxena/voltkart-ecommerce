import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({ value, onChange, placeholder, minLength }) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Lock size={18} className="absolute left-3 top-2.5 text-slate-400" />
      <input
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border py-2 pl-10 pr-10 outline-none focus:ring-2 focus:ring-indigo-400"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}