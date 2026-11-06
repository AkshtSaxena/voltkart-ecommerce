import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store.jsx";
import { ProductImage } from "../components/ProductUI.jsx";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const inputCls = "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-rose-600">{error}</span>}
    </label>
  );
}

export default function Checkout() {
  const { auth, api, cart, cartTotal, clearCart } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: auth?.user?.name || "", mobile: "", address: "", city: "", state: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!cart.length)
    return (
      <p className="py-20 text-center text-slate-500">
        Your cart is empty.{" "}
        <Link to="/" className="text-indigo-600 underline">
          Go shopping
        </Link>
      </p>
    );

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validate = () => {
    const err = {};
    if (form.fullName.trim().length < 2) err.fullName = "Please enter your full name";
    if (!/^[6-9]\d{9}$/.test(form.mobile)) err.mobile = "Enter a valid 10-digit mobile number";
    if (form.address.trim().length < 10) err.address = "Please enter your complete address";
    if (form.city.trim().length < 2) err.city = "Please enter your city";
    if (!form.state) err.state = "Please select your state";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      await api("/orders", {
        method: "POST",
        body: { items: cart.map(({ id, qty }) => ({ id, qty })), shipping: form },
      });
      clearCart();
      navigate("/history");
    } catch (err) {
      setApiError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-5">
      <form onSubmit={submit} className="space-y-4 rounded-xl border bg-white p-5 shadow-sm md:col-span-3">
        <h1 className="text-xl font-bold">Delivery details</h1>

        <Field label="Full name" error={errors.fullName}>
          <input value={form.fullName} onChange={set("fullName")} placeholder="Enter your full name" className={inputCls} />
        </Field>

        <Field label="Mobile number" error={errors.mobile}>
          <div className="flex">
            <span className="flex items-center rounded-l-lg border border-r-0 bg-slate-50 px-3 text-sm text-slate-500">+91</span>
            <input
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              inputMode="numeric"
              placeholder="10-digit mobile number"
              className={`${inputCls} rounded-l-none`}
            />
          </div>
        </Field>

        <Field label="Address" error={errors.address}>
          <textarea
            value={form.address}
            onChange={set("address")}
            rows={3}
            placeholder="House no., street, area, pincode"
            className={inputCls}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="City" error={errors.city}>
            <input value={form.city} onChange={set("city")} placeholder="Enter your city" className={inputCls} />
          </Field>

          <Field label="State" error={errors.state}>
            <select value={form.state} onChange={set("state")} className={inputCls}>
              <option value="">Select your state</option>
              {STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {apiError && <p className="text-sm text-rose-600">{apiError}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Placing order..." : `Place Order · ₹${cartTotal.toLocaleString("en-IN")}`}
        </button>
        <p className="text-center text-xs text-slate-500">Payment: Cash on Delivery</p>
      </form>

      <aside className="h-fit rounded-xl border bg-white p-5 shadow-sm md:col-span-2 md:sticky md:top-20">
        <h2 className="mb-3 font-bold">Order summary</h2>
        <div className="divide-y">
          {cart.map((i) => (
            <div key={i.id} className="flex items-center gap-3 py-2">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                <ProductImage p={i} emojiClass="text-2xl" />
              </div>
              <div className="flex-1 text-sm">
                <p className="line-clamp-1 font-medium">{i.name}</p>
                <p className="text-slate-500">Qty {i.qty}</p>
              </div>
              <span className="text-sm font-medium">₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t pt-3 font-bold">
          <span>Total</span>
          <span>₹{cartTotal.toLocaleString("en-IN")}</span>
        </div>
      </aside>
    </div>
  );
}