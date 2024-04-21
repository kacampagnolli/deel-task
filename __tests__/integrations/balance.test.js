const request = require("supertest");
const app = require("../../src/app");
const { Profile, Job, Contract } = app.get("models");
const { initTables, truncate } = require("../utils/sequelize");

describe("Balance", () => {
  beforeAll(() => {
    return initTables();
  });

  afterEach(() => {
    return truncate();
  });

  it("should return 400 if no amount is provided", async () => {
    // When
    const res = await request(app).post("/balances/deposit/1").send({});

    //Then
    expect(res.status).toBe(400);
  });

  it("should return 404 if user not found", async () => {
    // When
    const res = await request(app)
      .post("/balances/deposit/nonExistentUserId")
      .send({ amount: 100 });

    // Then
    expect(res.status).toBe(404);
  });

  it("should return 422 if user is not eligible", async () => {
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
    const res = await request(app)
      .post("/balances/deposit/1")
      .send({ amount: 100 });

    // Then
    expect(res.status).toBe(422);
  });

  it("should return 422 if deposit amount exceeds maximum", async () => {
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
        status: "in_progress",
        ClientId: 1,
        ContractorId: 2,
      }),
      Job.create({
        description: "work",
        price: 200,
        ContractId: 1,
      }),
    ]);

    // Then
    const res = await request(app)
      .post("/balances/deposit/1")
      .send({ amount: 100 });

    // When
    expect(res.status).toBe(422);
    expect(res.body.message).toContain(
      "Deposit amount exceeds the maximum allowed amount"
    );
    expect(res.body.maxAmount).toBe(50);
  });

  it("should return 200 and success message", async () => {
    // Given
    const clientId = 1;
    const balance = 1150;

    await Promise.all([
      Profile.create({
        id: clientId,
        firstName: "Harry",
        lastName: "Potter",
        profession: "Wizard",
        balance,
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
        status: "in_progress",
        ClientId: 1,
        ContractorId: 2,
      }),
      Job.create({
        description: "work",
        price: 200,
        ContractId: 1,
      }),
    ]);
    const amount = 50;

    // Then
    const res = await request(app)
      .post(`/balances/deposit/${clientId}`)
      .send({ amount });

    // When
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Deposit processed successfully.");
    const client = await Profile.findByPk(clientId);
    expect(client.balance).toBe(balance + amount);
  });
});
