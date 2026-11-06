import "dotenv/config";
import crypto from "crypto";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const frontendOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(cors({ origin: frontendOrigins }));
app.use(express.json());

// ---------- Models ----------
const User = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true }, // bcrypt hash, never plain text
      resetTokenHash: String, // forgot password
      resetTokenExpires: Date,
    },
    { timestamps: true }
  )
);

const Order = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      items: [{ productId: Number, name: String, price: Number, qty: Number }],
      total: Number,
      shipping: { fullName: String, mobile: String, address: String, city: String, state: String },
    },
    { timestamps: true }
  )
);


const PRODUCTS = [
  {
    id: 1, name: "Nova X5 Smartphone", price: 24999, oldPrice: 29999, rating: 4.5, category: "Mobiles", emoji: "📱", image: "/products/1.jpg",
    description: "A fast, all-day smartphone with a vivid AMOLED display and a versatile triple-camera system.",
    specs: ["6.6-inch AMOLED, 120 Hz display", "8 GB RAM + 128 GB storage", "5000 mAh battery with 33W fast charging"]
  },
  {
    id: 2, name: "AeroBook 14 Laptop", price: 54999, oldPrice: 64999, rating: 4.6, category: "Laptops", emoji: "💻", image: "/products/2.jpg",
    description: "A slim, lightweight laptop built for work, study and everyday multitasking.",
    specs: ["14-inch Full HD IPS display", "Core i5-class processor, 16 GB RAM", "512 GB SSD, up to 10 hours of battery life"]
  },
  {
    id: 3, name: "BassPro Wireless Headphones", price: 3999, oldPrice: 5999, rating: 4.3, category: "Audio", emoji: "🎧", image: "/products/3.jpg",
    description: "Over-ear wireless headphones with deep bass and comfortable all-day padding.",
    specs: ["Bluetooth 5.3 with dual-device pairing", "Up to 40 hours of playback", "Built-in mic for clear calls"]
  },
  {
    id: 4, name: "FitPulse Smartwatch", price: 4499, oldPrice: 6999, rating: 4.2, category: "Wearables", emoji: "⌚", image: "/products/4.jpg",
    description: "A lightweight smartwatch that tracks your fitness, sleep and heart rate.",
    specs: ["1.8-inch AMOLED display", "Heart rate, SpO2 and sleep tracking", "Up to 7 days of battery life"]
  },
  {
    id: 5, name: "SnapPro 4K Camera", price: 32999, oldPrice: 38999, rating: 4.7, category: "Cameras", emoji: "📷", image: "/products/5.jpg",
    description: "A compact camera for sharp photos and smooth 4K video.",
    specs: ["24 MP sensor", "4K video at 30 fps", "Wi-Fi and Bluetooth transfer"]
  },
  {
    id: 6, name: "PlayMax Game Console", price: 39999, oldPrice: 44999, rating: 4.8, category: "Gaming", emoji: "🎮", image: "/products/6.jpg",
    description: "A powerful console for smooth gameplay, fast loading and stunning visuals.",
    specs: ["1 TB SSD storage", "4K output at up to 60 fps", "Includes one wireless controller"]
  },
  {
    id: 7, name: "SoundBar Mini Speaker", price: 2499, oldPrice: 3499, rating: 4.1, category: "Audio", emoji: "🔊", image: "/products/7.jpg",
    description: "A portable speaker that delivers rich, room-filling sound wherever you go.",
    specs: ["20 W stereo output", "IPX5 water resistance", "Up to 12 hours of playtime"]
  },
  {
    id: 8, name: 'ViewMax 27" Monitor', price: 15999, oldPrice: 18999, rating: 4.4, category: "Displays", emoji: "🖥️", image: "/products/8.jpg",
    description: "A 27-inch monitor with accurate colours and a smooth refresh rate for work and play.",
    specs: ["QHD (2560 x 1440) IPS panel", "75 Hz refresh rate", "HDMI and DisplayPort inputs"]
  },
  {
    id: 9, name: "TabPro 11 Tablet", price: 27999, oldPrice: 32999, rating: 4.4, category: "Tablets", emoji: "📲", image: "/products/9.jpg",
    description: "A sleek tablet for streaming, note-taking and learning on the go.",
    specs: ["11-inch 2K display", "6 GB RAM + 128 GB storage", "8000 mAh battery"]
  },
  {
    id: 10, name: "AirBuds Lite Earbuds", price: 1999, oldPrice: 2999, rating: 4.0, category: "Audio", emoji: "🎶", image: "/products/10.jpg",
    description: "True wireless earbuds with clear calls and a pocket-sized charging case.",
    specs: ["Bluetooth 5.3", "Up to 24 hours with charging case", "Touch controls and built-in mic"]
  },
  {
    id: 11, name: "ChargeMax 20000mAh Power Bank", price: 1799, oldPrice: 2499, rating: 4.3, category: "Accessories", emoji: "🔋", image: "/products/11.jpg",
    description: "A high-capacity power bank to keep your devices charged all day.",
    specs: ["20,000 mAh capacity", "22.5W fast charging", "Dual USB-A and one USB-C port"]
  },
  {
    id: 12, name: "ClickPro Mechanical Keyboard", price: 3499, oldPrice: 4999, rating: 4.5, category: "Accessories", emoji: "⌨️", image: "/products/12.jpg",
    description: "A mechanical keyboard with satisfying keys and customisable backlighting.",
    specs: ["Tactile mechanical switches", "RGB backlighting", "Full-size layout with anti-ghosting"]
  },
  {
    id: 13, name: "GlidePro Wireless Mouse", price: 899, oldPrice: 1499, rating: 4.2, category: "Accessories", emoji: "🖱️", image: "/products/13.jpg",
    description: "A comfortable wireless mouse with precise tracking for everyday use.",
    specs: ["2.4 GHz wireless with USB receiver", "Adjustable DPI up to 3200", "Long-lasting battery life"]
  },
  {
    id: 14, name: "StreamCam Full HD Webcam", price: 2499, oldPrice: 3499, rating: 4.1, category: "Cameras", emoji: "📹", image: "/products/14.jpg",
    description: "A Full HD webcam for sharp video calls, streaming and online classes.",
    specs: ["1080p at 30 fps", "Built-in noise-reducing microphone", "Plug and play over USB"]
  },
  {
    id: 15, name: "SwiftNet Wi-Fi 6 Router", price: 2999, oldPrice: 3999, rating: 4.3, category: "Networking", emoji: "📡", image: "/products/15.jpg",
    description: "A dual-band Wi-Fi 6 router for fast, stable internet across your home.",
    specs: ["Wi-Fi 6, up to 1800 Mbps", "Dual-band with 4 antennas", "Gigabit LAN ports"]
  },
  {
    id: 16, name: "VaultX 1TB Portable SSD", price: 7499, oldPrice: 9499, rating: 4.6, category: "Storage", emoji: "💾", image: "/products/16.jpg",
    description: "A pocket-sized portable SSD for fast, reliable backups and file transfers.",
    specs: ["1 TB capacity", "Read speeds up to 1000 MB/s", "USB-C with shock-resistant body"]
  },
];


const REVIEWERS = ["Rohit S.", "Priya M.", "Amit K.", "Neha P.", "Vikram R.", "Sneha D.", "Arjun T.", "Kavya N.", "Rahul G.", "Ananya B.", "Manish J.", "Pooja V."];
const REVIEW_POOL = [
  { rating: 5, title: "Worth every rupee", text: "Excellent quality and performance. It works exactly as described and the packaging was great." },
  { rating: 5, title: "Highly recommended", text: "Been using it for a few weeks now and I am very happy with the purchase. Delivery was quick too." },
  { rating: 4, title: "Very good value", text: "Solid build and good features for the price. A little room for improvement, but overall a great buy." },
  { rating: 5, title: "Exceeded expectations", text: "Setup was easy and the quality feels premium. I would definitely buy again." },
  { rating: 4, title: "Good, does the job", text: "Performs well in daily use. The product matches the photos and arrived well packed." },
  { rating: 3, title: "Decent, not perfect", text: "Does what it promises, though I expected slightly better finishing. Fair for the price." },
  { rating: 5, title: "Great purchase", text: "Fast delivery and the product is exactly what I needed. Customer support was helpful as well." },
  { rating: 4, title: "Happy with it", text: "Reliable and easy to use. I have already recommended it to friends and family." },
];
const reviewsFor = (id) =>
  Array.from({ length: 6 }, (_, i) => ({
    ...REVIEW_POOL[(id + i * 3) % REVIEW_POOL.length],
    name: REVIEWERS[(id * 2 + i * 5) % REVIEWERS.length],
    daysAgo: ((id * 7 + i * 13) % 80) + 3,
  }));

// ---------- Helpers ----------
const sendAuth = (user) => ({
  token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { id: user._id, name: user.name, email: user.email },
});

const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

// Require a valid JWT before continuing.
const auth = (req, res, next) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ message: "Please login first" });
  }
};

// ---------- Auth routes ----------
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: "Name, email and password (min 6 chars) are required" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(sendAuth(user));
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase() });
  // Return a token only for a registered user with a valid password.
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json(sendAuth(user));
});


app.post("/api/auth/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  const out = { message: "If this email is registered, a password reset link has been generated." };
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    user.resetTokenHash = hashToken(token); // Store only the token hash.
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const resetUrl = `${frontendOrigins[0] || "http://localhost:5173"}/reset-password/${token}`;
    console.log("Password reset link:", resetUrl);
    if (process.env.NODE_ENV !== "production") out.devResetLink = resetUrl;
  }
  res.json(out);
});

app.post("/api/auth/reset-password/:token", async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6)
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  const user = await User.findOne({
    resetTokenHash: hashToken(req.params.token),
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired" });
  user.password = await bcrypt.hash(password, 10);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  res.json({ message: "Password updated successfully. You can now log in." });
});

// ---------- Shop routes ----------
app.get("/api/products", (req, res) => res.json(PRODUCTS));

app.get("/api/products/:id", (req, res) => {
  const p = PRODUCTS.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ message: "Product not found" });
  res.json({ ...p, reviewCount: 40 + ((p.id * 53) % 400), reviews: reviewsFor(p.id) });
});

app.post("/api/orders", auth, async (req, res) => {
  const { fullName, mobile, address, city, state } = req.body.shipping || {};
  if (!fullName?.trim() || !/^[6-9]\d{9}$/.test(String(mobile || "")) || !address?.trim() || !city?.trim() || !state?.trim())
    return res.status(400).json({ message: "Please provide a valid name, 10-digit mobile number, address, city and state" });

  const items = (req.body.items || [])
    .map(({ id, qty }) => {
      const p = PRODUCTS.find((x) => x.id === id);
      return p && qty > 0 ? { productId: p.id, name: p.name, price: p.price, qty: Math.floor(qty) } : null;
    })
    .filter(Boolean);
  if (!items.length) return res.status(400).json({ message: "Cart is empty" });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = { fullName: fullName.trim(), mobile: String(mobile), address: address.trim(), city: city.trim(), state: state.trim() };
  res.status(201).json(await Order.create({ user: req.userId, items, total, shipping }));
});

app.get("/api/orders", auth, async (req, res) =>
  res.json(await Order.find({ user: req.userId }).sort({ createdAt: -1 }))
);

// ---------- Error handler + start ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Server error" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log("Server running on port " + (process.env.PORT || 5000))))
  .catch((e) => console.error("MongoDB connection failed:", e.message));
