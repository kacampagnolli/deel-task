const { profileToQuery } = require("../utils/query");

const listUnpaid = async (req, res) => {
  const profile = req.profile;
  const { Job, Contract } = req.app.get("models");
  console.log(req.app.get("models"));
  const jobs = await Job.findAll({
    include: [
      {
        model: Contract,
        where: {
          ...profileToQuery(profile),
        },
        attributes: [],
      },
    ],
    where: {
      paid: false,
    },
  });

  res.json({ data: jobs });
};

const pay = async (req, res) => {
  const { id } = req.params;
  const profile = req.profile;

  const { Profile, Job } = req.app.get("models");
  const sequelize = req.app.get("sequelize");

  const t = await sequelize.transaction();

  try {
    const jobToPay = await sequelize.query(
      `
      SELECT j.id, j.price, j.paid, c.id as contractId, c.ClientId as clientId, c.ContractorId as contractorId
      FROM 
        Jobs j
      INNER JOIN 
        Contracts c on c.id = j.ContractId
      WHERE 
        j.id = :jobId
        AND c.ClientId = :clientId
    `,
      {
        plain: true,
        raw: true,
        replacements: { jobId: id, clientId: profile.id },
        transaction: t,
      }
    );

    if (!jobToPay) {
      throw new JobNotFound(jobToPay.id);
    }

    if (jobToPay.paid) {
      throw new PaymentError(`Job '${jobToPay.id}' has already been paid.`);
    }

    const [client, contractor] = await Promise.all([
      Profile.findByPk(jobToPay.clientId, { transaction: t }),
      Profile.findByPk(jobToPay.contractorId, { transaction: t }),
    ]);

    if (client.balance < jobToPay.price) {
      throw new PaymentError("Insufficient Balance");
    }

    await Promise.all([
      client.increment("balance", {
        by: -jobToPay.price,
        transaction: t,
      }),
      contractor.increment("balance", {
        by: jobToPay.price,
        transaction: t,
      }),
    ]);

    await Job.update(
      { paid: true, paymentDate: Date.now() },
      {
        where: { id: jobToPay.id },
        transaction: t,
      }
    );

    await t.commit();

    res
      .json({
        message: "Payment for the job has been successfully processed.",
      })
      .end();
  } catch (e) {
    await t.rollback();
    if (e instanceof JobNotFound) {
      return res.status(404).json({ message: e.message }).end();
    } else if (e instanceof PaymentError) {
      return res.status(422).json({ message: e.message }).end();
    } else {
      return res.status(500).json({ message: `Internal server erro.` }).end();
    }
  }
};

module.exports = {
  listUnpaid,
  pay,
};
