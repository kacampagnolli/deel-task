const request = require("supertest");
const app = require("../../src/app");
const { Profile, Contract, Job } = app.get("models");
const { initTables, truncate } = require("../utils/sequelize");

describe("Contract", () => {
  beforeAll(() => {
    return initTables();
  });

  afterEach(() => {
    return truncate();
  });
  describe("listUnpaid", () => {
    it("should return a list of unpaid jobs", async () => {
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
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: Date.now(),
        }),
      ]);

      const jobs = await Promise.all([
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
        }),
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
        }),
      ]);

      //When
      const res = await request(app).get("/jobs/unpaid").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(jobs.length);
    });

    it("should return an empty list if no unpaid jobs found", async () => {
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
      const res = await request(app).get("/jobs/unpaid").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("pay", () => {
    it("should successfully process payment for a valid job", async () => {
      // Given
      await Promise.all([
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 500,
          type: "client",
        }),
        Profile.create({
          id: 2,
          firstName: "Mr",
          lastName: "Robot",
          profession: "Hacker",
          balance: 100,
          type: "contractor",
        }),
        Contract.create({
          id: 1,
          terms: "bla bla bla",
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
          id: 1,
        }),
      ]);

      // When
      const res = await request(app).post("/jobs/1/pay").set("profile_id", 1);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.message).toBe(
        "Payment for the job has been successfully processed."
      );

      const [client, contractor, job] = await Promise.all([
        Profile.findByPk(1),
        Profile.findByPk(2),
        Job.findByPk(1),
      ]);

      expect(client.balance).toBe(300);
      expect(contractor.balance).toBe(300);
      expect(job.paid).toBe(true);
    });

    it("should return 404 if job to pay is not found", async () => {
      // Given
      await Profile.create({
        id: 1,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance: 1150,
        type: "client",
      });

      // When
      const res = await request(app).post("/jobs/1/pay").set("profile_id", 1);

      // Then
      expect(res.status).toBe(404);
    });

    it("should return 422 if job has already been paid", async () => {
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
          status: "new",
          ClientId: 1,
          ContractorId: 2,
        }),
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
          paid: true,
          paymentDate: Date.now(),
          id: 1,
        }),
      ]);

      // When
      const res = await request(app).post("/jobs/1/pay").set("profile_id", 1);

      // Then
      expect(res.status).toBe(422);
      expect(res.body.message).toBe("Job 1 has already been paid.");
    });

    it("should return 422 if client has insufficient balance", async () => {
      // Given
      await Promise.all([
        Profile.create({
          id: 1,
          firstName: "Harry",
          lastName: "Potter",
          profession: "Wizard",
          balance: 10,
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
        Job.create({
          description: "work",
          price: 200,
          ContractId: 1,
          id: 1,
        }),
      ]);

      // When
      const res = await request(app).post("/jobs/1/pay").set("profile_id", 1);

      // Then
      expect(res.status).toBe(422);
      expect(res.body.message).toBe("Insufficient Balance");
    });
  });
});
