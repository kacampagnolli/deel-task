const express = require("express");
const bodyParser = require("body-parser");
const { sequelize } = require("./model");

const { getProfile } = require("./middleware/getProfile");

const contractRoutes = require("./routes/contract");
const balanceRoutes = require("./routes/balance");
const jobRoutes = require("./routes/job");
const adminRoutes = require("./routes/admin");

const app = express();

app.use(bodyParser.json());
app.set("sequelize", sequelize);
app.set("models", sequelize.models);

app.use("/balances", balanceRoutes);
app.use("/admin", adminRoutes);

app.use(getProfile);
app.use("/contracts", contractRoutes);
app.use("/jobs", jobRoutes);

module.exports = app;
