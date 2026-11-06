import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";
import Shop from "./pages/Shop.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderHistory from "./pages/History.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { ForgotPassword, ResetPassword } from "./pages/Recover.jsx";
import { useStore } from "./store.jsx";


function Protected({ children }) {
  const { auth } = useStore();
  return auth ? children : <Navigate to="/login" replace />;
}


function GuestOnly({ children }) {
  const { auth } = useStore();
  return auth ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      <Toast />
      <main className="mx-auto max-w-6xl p-4">
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
          <Route path="/history" element={<Protected><OrderHistory /></Protected>} />
          <Route path="/login" element={<GuestOnly><AuthPage key="login" mode="login" /></GuestOnly>} />
          <Route path="/register" element={<GuestOnly><AuthPage key="register" mode="register" /></GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}