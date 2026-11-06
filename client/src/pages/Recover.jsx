import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Mail } from "lucide-react";
import PasswordInput from "../components/PasswordInput.jsx";
import { useStore } from "../store.jsx";

const card = "mx-auto mt-10 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm";
const inputCls = "w-full rounded-lg border py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-400";
const primary = "w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60";

export function ForgotPassword() {
  const { api } = useStore();
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      setResult(await api("/auth/forgot-password", { method: "POST", body: { email } }));
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={submit} className={card}>
      <h1 className="text-xl font-bold">Forgot password?</h1>
      <p className="text-sm text-slate-500">Enter your registered email and we will generate a reset link.</p>
      <div className="relative">
        <Mail size={18} className="absolute left-3 top-2.5 text-slate-400" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputCls}
        />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {result && (
        <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          <p>{result.message}</p>
          {result.devResetLink && (
            <Link to={result.devResetLink} className="mt-2 inline-block font-medium text-indigo-600 underline">
              Open reset page (demo mode)
            </Link>
          )}
        </div>
      )}
      <button disabled={loading} className={primary}>
        {loading ? "Please wait..." : "Send reset link"}
      </button>
      <p className="text-center text-sm">
        <Link to="/login" className="text-indigo-600 underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetPassword() {
  const { token } = useParams();
  const { api } = useStore();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) return setError("Passwords do not match");
    setLoading(true);
    try {
      const data = await api(`/auth/reset-password/${token}`, { method: "POST", body: { password: form.password } });
      setDone(data.message);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (done)
    return (
      <div className={card}>
        <h1 className="text-xl font-bold">Password updated</h1>
        <p className="text-sm text-emerald-700">{done}</p>
        <Link to="/login" className={`${primary} block text-center`}>
          Go to login
        </Link>
      </div>
    );

  return (
    <form onSubmit={submit} className={card}>
      <h1 className="text-xl font-bold">Set a new password</h1>
      <PasswordInput
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        placeholder="New password (min 6 chars)"
        minLength={6}
      />
      <PasswordInput
        value={form.confirm}
        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        placeholder="Confirm new password"
        minLength={6}
      />
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button disabled={loading} className={primary}>
        {loading ? "Please wait..." : "Update password"}
      </button>
    </form>
  );
}