import { Link, NavLink, useNavigate } from "react-router-dom";
import { History, LogIn, LogOut, ShoppingCart, Store, UserPlus, Zap } from "lucide-react";
import { useStore } from "../store.jsx";

const base = "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition";
const cls = ({ isActive }) =>
  `${base} ${isActive ? "bg-indigo-100 text-indigo-700" : "text-slate-600 hover:bg-slate-100"}`;

export default function Navbar() {
  const { auth, logout, cartCount } = useStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 p-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-indigo-600">
          <Zap size={22} />
          <span className="hidden sm:inline">VoltKart</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={cls}>
            <Store size={18} />
            <span className="hidden sm:inline">Shop</span>
          </NavLink>

          <NavLink to="/cart" className={cls}>
            <span className="relative">
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-1.5 text-[10px] text-white">
                  {cartCount}
                </span>
              )}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </NavLink>

          {auth ? (
            <>
              <NavLink to="/history" className={cls}>
                <History size={18} />
                <span className="hidden sm:inline">History</span>
              </NavLink>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className={`${base} text-slate-600 hover:bg-slate-100`}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout ({auth.user.name.split(" ")[0]})</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={cls}>
                <LogIn size={18} />
                <span className="hidden sm:inline">Login</span>
              </NavLink>
              <NavLink to="/register" className={cls}>
                <UserPlus size={18} />
                <span className="hidden sm:inline">Register</span>
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
