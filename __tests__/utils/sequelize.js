const app = require("../../src/app");
const { Profile, Job, Contract } = app.get("models");

async function initTables() {
  return Promise.all([
    Profile.sync({ force: true }),
    Contract.sync({ force: true }),
    Job.sync({ force: true }),
  ]);
}

async function truncate() {
  return Promise.all([
    Profile.destroy({ truncate: true, force: true }),
    Contract.destroy({ truncate: true, force: true }),
    Job.destroy({ truncate: true, force: true }),
  ]);
}

module.exports = {
  initTables,
  truncate,
};
