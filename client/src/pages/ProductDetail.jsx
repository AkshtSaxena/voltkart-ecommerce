import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, BadgeCheck, Check, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { useStore } from "../store.jsx";
import { AddToCart, Stars } from "../components/ProductUI.jsx";
import ImageCarousel from "../components/ImageCarousel.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const { api } = useStore();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setP(null);
    setError("");
    window.scrollTo(0, 0);
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="py-20 text-center">
        <p className="mb-3 text-slate-600">{error}</p>
        <Link to="/" className="text-indigo-600 underline">Back to shop</Link>
      </div>
    );

  if (!p)
    return (
      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="shimmer aspect-square rounded-2xl" />
        <div className="space-y-4">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer h-8 w-3/4 rounded" />
          <div className="shimmer h-28 rounded" />
        </div>
      </div>
    );

  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to shop
      </Link>

      <div className="fade-up grid gap-8 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-2 md:p-8">
        <ImageCarousel p={p} />

        <div className="flex flex-col">
          <span className="text-sm font-medium text-indigo-600">{p.category}</span>
          <h1 className="mt-1 text-2xl font-bold">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <Stars value={p.rating} size={16} />
            <span className="font-medium">{p.rating}</span>
            {p.reviewCount && <span className="text-slate-400">({p.reviewCount} reviews)</span>}
          </div>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold">₹{p.price.toLocaleString("en-IN")}</span>
            {p.oldPrice && <span className="text-slate-400 line-through">₹{p.oldPrice.toLocaleString("en-IN")}</span>}
            {off > 0 && <span className="rounded-full bg-rose-100 px-2 py-0.5 text-sm font-semibold text-rose-600">{off}% OFF</span>}
          </div>

          <p className="mt-4 text-slate-600">{p.description}</p>

          <ul className="mt-4 space-y-2">
            {p.specs?.map((s) => (
              <li key={s} className="flex items-center gap-2 text-sm">
                <Check size={16} className="text-emerald-600" /> {s}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <AddToCart product={p} large />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 border-t pt-4 text-center text-xs text-slate-500">
            <div className="flex flex-col items-center gap-1"><Truck size={20} /> Free delivery</div>
            <div className="flex flex-col items-center gap-1"><ShieldCheck size={20} /> 1-year warranty</div>
            <div className="flex flex-col items-center gap-1"><RotateCcw size={20} /> 7-day returns</div>
          </div>
        </div>
      </div>

      {p.reviews?.length > 0 && (
        <section className="fade-up mt-8 rounded-2xl border bg-white p-4 shadow-sm md:p-8">
          <h2 className="text-xl font-bold">Customer Reviews</h2>
          <div className="mt-3 flex items-center gap-4">
            <span className="text-4xl font-bold">{p.rating}</span>
            <div>
              <Stars value={p.rating} size={18} />
              <p className="mt-1 text-sm text-slate-500">Based on {p.reviewCount} reviews</p>
            </div>
          </div>

          <div className="mt-4 divide-y">
            {p.reviews.map((r, i) => (
              <div key={i} className="py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                    {r.name[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{r.name}</p>
                    <p className="flex items-center gap-1 text-xs text-emerald-600">
                      <BadgeCheck size={14} /> Verified Purchase
                    </p>
                  </div>
                  <span className="ml-auto text-xs text-slate-400">{r.daysAgo} days ago</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="text-sm font-semibold">{r.title}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}