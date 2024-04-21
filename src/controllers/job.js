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
  res.json({});
};

module.exports = {
  listUnpaid,
  pay,
};
