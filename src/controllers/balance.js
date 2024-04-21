const DepositAmountError = require("../errors/DepositAmountError");

const deposit = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  if (!amount) {
    return res
      .status(400)
      .json({
        message: "Invalid amount. Please provide a valid positive number.",
      })
      .end();
  }

  const { Job, Profile, Contract } = req.app.get("models");

  const client = await Profile.findOne({ where: { id: userId } });

  if (!client) {
    return res.status(404).json({ message: "User not found" }).end();
  }
  console.log(client);

  if (client.type !== "client") {
    return res
      .status(422)
      .json({
        message:
          "This user is not eligible to receive money through this method.",
      })
      .end();
  }

  const sequelize = req.app.get("sequelize");
  const t = await sequelize.transaction();

  try {
    const amountToPay = await Job.sum("price", {
      where: { paid: false },
      include: [
        {
          model: Contract,
          where: {
            ClientId: userId,
          },
          attributes: [],
        },
      ],
      attributes: [],
      transaction: t,
    });

    const maxAmount = amountToPay * 0.25;

    if (amount > maxAmount) {
      throw new DepositAmountError(amount, maxAmount);
    }

    await client.increment("balance", {
      by: amount,
      transaction: t,
    });

    await t.commit();
    res.json({ message: "Deposit processed successfully." });
  } catch (e) {
    await t.rollback();
    if (e instanceof DepositAmountError) {
      return res
        .status(422)
        .json({ message: e.message, amount: e.amount, maxAmount: e.maxAmount })
        .end();
    }
    return res.status(500).json({ message: e.message }).end();
  }
};

module.exports = {
  deposit,
};
