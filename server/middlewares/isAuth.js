import jwt from "jsonwebtoken";

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
    }

    if (typeof token !== "string" || !token.trim()) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format.",
      });
    }

    let verifyToken;
    try {
      verifyToken = jwt.verify(token.trim(), process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({
        success: false,
        message:
          jwtErr.name === "TokenExpiredError"
            ? "Authentication token has expired. Please sign in again."
            : "Invalid authentication token.",
      });
    }

    if (!verifyToken || !verifyToken.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    req.userId = verifyToken.userId;
    next();
  } catch (error) {
    console.error("[isAuth] Unexpected error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Authentication failed.",
    });
  }
};

export default isAuth;
