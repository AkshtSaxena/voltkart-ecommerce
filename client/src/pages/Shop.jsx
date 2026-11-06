import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, Search, SlidersHorizontal, X } from "lucide-react";
import { useStore } from "../store.jsx";
import { AddToCart, ProductImage, Stars } from "../components/ProductUI.jsx";

const DEMO_DELAY = 1200;
const MAX_PRICE = 60000;
const PAGE_SIZE = 8;

const sorters = {
  featured: () => 0,
  low: (a, b) => a.price - b.price,
  high: (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => a.name.localeCompare(b.name),
};

const gridCls = "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4";

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-xl border bg-white p-4 shadow-sm">
      <div className="shimmer mb-3 aspect-[4/3] rounded-lg" />
      <div className="shimmer mb-2 h-3 w-16 rounded" />
      <div className="shimmer h-4 w-3/4 rounded" />
      <div className="mt-4 flex items-center justify-between">
        <div className="shimmer h-5 w-20 rounded" />
        <div className="shimmer h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function ProductCard({ p, index }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  const off = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <div
      ref={ref}
      onClick={() => navigate(`/product/${p.id}`)}
      style={{ animationDelay: `${(index % 4) * 80}ms` }}
      className={`group flex cursor-pointer flex-col rounded-xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${
        seen ? "fade-up" : "opacity-0"
      }`}
    >
      <div className="relative mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-slate-100 to-slate-200">
        <ProductImage
          p={p}
          className="transition-transform duration-500 group-hover:scale-110"
          emojiClass="text-7xl transition-transform duration-500 group-hover:scale-110"
        />
        {off > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">
            {off}% OFF
          </span>
        )}
      </div>

      <span className="text-xs text-slate-500">{p.category}</span>
      <h3 className="line-clamp-2 flex-1 font-semibold">{p.name}</h3>
      <div className="mt-1 flex items-center gap-1 text-sm text-slate-600">
        <Stars value={p.rating} /> {p.rating}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-bold">₹{p.price.toLocaleString("en-IN")}</p>
          {p.oldPrice && <p className="text-xs text-slate-400 line-through">₹{p.oldPrice.toLocaleString("en-IN")}</p>}
        </div>
        <div className="ml-auto">
          <AddToCart product={p} />
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const { api } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("featured");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinel = useRef(null);

  useEffect(() => {
    new Promise((r) => setTimeout(r, DEMO_DELAY))
      .then(() => api("/products"))
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const shown = products
    .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price <= maxPrice)
    .sort(sorters[sort]);

  const hasMore = visible < shown.length;

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [q, sort, category, maxPrice]);

  useEffect(() => {
    if (!hasMore || loading || !sentinel.current) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisible((v) => v + PAGE_SIZE);
            setLoadingMore(false);
          }, 700);
        }
      },
      { rootMargin: "150px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [hasMore, loading, loadingMore]);

  const activeFilters = (category !== "All") + (maxPrice < MAX_PRICE);
  const reset = () => {
    setCategory("All");
    setMaxPrice(MAX_PRICE);
  };

  return (
    <>
      {/* Search + Sort + Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search electronics..."
            className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="relative">
          <ArrowUpDown size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none rounded-lg border bg-white py-2 pl-9 pr-4 outline-none focus:ring-2 focus:ring-indigo-400 sm:w-52"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 font-medium transition ${
            showFilters ? "border-indigo-600 bg-indigo-600 text-white" : "bg-white hover:bg-slate-100"
          }`}
        >
          <SlidersHorizontal size={16} /> Filters
          {activeFilters > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-xs text-white">{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="fade-up mb-4 space-y-4 rounded-xl border bg-white p-4">
          <div>
            <p className="mb-2 text-sm font-semibold">Category</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    category === c ? "border-indigo-600 bg-indigo-600 text-white" : "hover:bg-slate-100"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold">Max price: ₹{maxPrice.toLocaleString("en-IN")}</p>
            <input
              type="range"
              min="1000"
              max={MAX_PRICE}
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
          <button onClick={reset} className="flex items-center gap-1 text-sm text-rose-600">
            <X size={14} /> Reset filters
          </button>
        </div>
      )}

      {error && <p className="mb-3 text-rose-600">{error} (is the server running?)</p>}
      {!loading && !error && shown.length > 0 && <p className="mb-3 text-sm text-slate-500">{shown.length} products</p>}

      <div className={gridCls}>
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : shown.slice(0, visible).map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}
      </div>

      {/* Infinite scroll sentinel */}
      {!loading && hasMore && (
        <div ref={sentinel} className="min-h-10 pt-4">
          {loadingMore && (
            <div className={gridCls}>
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && !hasMore && shown.length > PAGE_SIZE && (
        <p className="py-8 text-center text-sm text-slate-400">You have reached the end of the list</p>
      )}

      {!loading && !error && shown.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-medium text-slate-700">No products found</p>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or clearing the filters.</p>
          <button
            onClick={() => {
              setQ("");
              reset();
            }}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </>
  );
}