const request = require("supertest");
const app = require("../../src/app");
const { Profile, Contract } = app.get("models");
const { initTables, truncate } = require("../utils/sequelize");

describe("Contract", () => {
  beforeAll(() => {
    return initTables();
  });

  afterEach(() => {
    return truncate();
  });
});
