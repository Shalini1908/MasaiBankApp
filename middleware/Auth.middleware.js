const jwt = require("jsonwebtoken");

async function Auth(req, res, next) {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, "masai", function (err, decoded) {
      req.body.accountId = decoded.data.accountId;
      next();
    });
  } else {
    res.send({ msg: "You are not authorized" });
  }
}

module.exports={Auth};