const isClient = async (req, res, next) => {
  const profile = req.profile;
  if (profile.type !== "client") {
    return res
      .status(403)
      .json({
        message:
          "Access to this functionality is restricted to client accounts only.",
      })
      .end();
  }
  next();
};
module.exports = { isClient };
