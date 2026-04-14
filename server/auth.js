import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tahliliy_jwt_secret_change_this_in_production";

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, email, full_name }
    next();
  } catch {
    return res.status(401).json({ error: "الجلسة منتهية، سجّل الدخول مجددًا" });
  }
}

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, full_name: user.full_name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}
