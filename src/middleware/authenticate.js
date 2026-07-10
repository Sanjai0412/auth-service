const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing",
    });
  }
  try {
    // Verify token with access token
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
