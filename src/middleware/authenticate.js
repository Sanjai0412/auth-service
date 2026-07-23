const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing",
    });
  }
  try {
    // Verify token with access token secret
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // add payload to req object
    req.user = decoded;
    next(); // proceed to route handler
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = authenticateToken;
