import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User } from "lucide-react";
import { useStore } from "../store.jsx";
import PasswordInput from "../components/PasswordInput.jsx";

export default function AuthPage({ mode }) {
  const isLogin = mode === "login";
  const { api, setAuth } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: form });
      setAuth(data); // Persist the authenticated user and token in local storage.
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const field = (key, Icon, type, placeholder) => (
    <div className="relative">
      <Icon size={18} className="absolute left-3 top-2.5 text-slate-400" />
      <input
        type={type}
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        required
        className="w-full rounded-lg border py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-400"
      />
    </div>
  );

  return (
    <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-xl font-bold">{isLogin ? "Welcome back" : "Create account"}</h1>
      {!isLogin && field("name", User, "text", "Full name")}
      {field("email", Mail, "email", "Email")}
      <PasswordInput
        value={form.password}
        onChange={set("password")}
        placeholder={isLogin ? "Password" : "Password (min 6 chars)"}
      />
      {isLogin && (
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
            Forgot password?
          </Link>
        </div>
      )}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
      </button>
      <p className="text-center text-sm text-slate-500">
        {isLogin ? "New here?" : "Already registered?"}{" "}
        <Link to={isLogin ? "/register" : "/login"} className="text-indigo-600 underline">
          {isLogin ? "Register" : "Login"}
        </Link>
      </p>
    </form>
  );
}