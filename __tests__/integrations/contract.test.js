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

  describe("getContractById", () => {
    it("should return 404 if contract not found", async () => {
      //Given
      await Profile.create({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1150,
        type: "contractor",
      });

      // When
      const res = await request(app).get("/contracts/123").set("profile_id", 1);

      // Then
      expect(res.status).toBe(404);
    });

    it("should return 404 if the contract does not belong to the user", async () => {
      // Given
      await Promise.all([
        Profile.create({
          id: 3,
          firstName: "John",
          lastName: "Snow",
          profession: "Knows nothing",
          balance: 451.3,
          type: "client",
        }),
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        }),
        Profile.create({
          id: 2,
          firstName: "Mr",
          lastName: "Robot",
          profession: "Hacker",
          balance: 231.11,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
      ]);

      // When
      const res = await request(app).get("/contracts/1").set("profile_id", 3);

      // Then
      expect(res.status).toBe(404);
    });

    it("should return the contract if found", async () => {
      // Given
      const [, , contract] = await Promise.all([
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        }),
        Profile.create({
          id: 2,
          firstName: "Mr",
          lastName: "Robot",
          profession: "Hacker",
          balance: 231.11,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
      ]);

      // When
      const res = await request(app).get("/contracts/1").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(contract.id);
      expect(res.body.terms).toBe(contract.terms);
      expect(res.body.ContractorId).toBe(contract.ContractorId);
      expect(res.body.ClientId).toBe(contract.ClientId);
    });
  });

  describe("listContracts", () => {
    it("should return a list of contracts excluding terminated ones", async () => {
      // Given
      await Promise.all([
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 1150,
          type: "client",
        }),
        Profile.create({
          id: 2,
          firstName: "Mr",
          lastName: "Robot",
          profession: "Hacker",
          balance: 231.11,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "terminated",
          ClientId: 1,
          ContractorId: 2,
        }),
      ]);

      const contracts = await Promise.all([
        Contract.create({
          id: 2,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
        Contract.create({
          id: 3,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
        Contract.create({
          id: 4,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
      ]);

      //When
      const res = await request(app).get("/contracts").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(contracts.length);
    });
    it("should return an empty list if no active contracts found", async () => {
      // Given
      await Profile.create({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1150,
        type: "contractor",
      });

      // When
      const res = await request(app).get("/contracts").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });
});
