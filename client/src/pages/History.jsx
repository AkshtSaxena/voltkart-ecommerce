import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, PackageCheck } from "lucide-react";
import { useStore } from "../store.jsx";
import { ProductImage } from "../components/ProductUI.jsx";

export default function OrderHistory() {
  const { api } = useStore();
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState({});

  useEffect(() => {
    Promise.all([api("/orders"), api("/products")])
      .then(([o, p]) => {
        setOrders(o);
        setProducts(Object.fromEntries(p.map((x) => [x.id, x])));
      })
      .catch(() => setOrders([]));
  }, []);

  if (!orders) return <p>Loading...</p>;
  if (!orders.length) return <p className="py-20 text-center text-slate-500">No orders yet.</p>;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <h1 className="text-xl font-bold">Order History</h1>
      {orders.map((o) => (
        <div key={o._id} className="rounded-xl border bg-white p-4">
          <div className="mb-2 flex justify-between text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <PackageCheck size={16} /> #{o._id.slice(-6)}
            </span>
            <span>{new Date(o.createdAt).toLocaleString("en-IN")}</span>
          </div>

          <div className="divide-y">
            {o.items.map((i) => {
              const prod = products[i.productId] || { name: i.name, emoji: "📦" };
              return (
                <div key={i._id} className="flex items-center gap-3 py-2">
                  <Link
                    to={`/product/${i.productId}`}
                    className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100"
                  >
                    <ProductImage p={prod} emojiClass="text-2xl" />
                  </Link>
                  <div className="flex-1 text-sm">
                    <Link to={`/product/${i.productId}`} className="font-medium hover:text-indigo-600">
                      {i.name}
                    </Link>
                    <p className="text-slate-500">
                      Qty {i.qty} × ₹{i.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <span className="text-sm font-medium">₹{(i.price * i.qty).toLocaleString("en-IN")}</span>
                </div>
              );
            })}
          </div>

          {o.shipping?.fullName && (
            <div className="mt-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              <p>
                <span className="font-medium text-slate-800">{o.shipping.fullName}</span> · +91 {o.shipping.mobile}
                <br />
                {[o.shipping.address, o.shipping.city, o.shipping.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}

          <p className="mt-2 border-t pt-2 text-right font-bold">Total: ₹{o.total.toLocaleString("en-IN")}</p>
        </div>
      ))}
    </div>
  );
}