const { Op } = require("sequelize");
const { profileToQuery } = require("../utils/query");

const getContractById = async (req, res) => {
  const profile = req.profile;
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: {
      id,
      ...profileToQuery(profile),
    },
  });
  if (!contract) {
    return res
      .status(404)
      .json({ message: `Contract ${id} not found` })
      .end();
  }
  res.json(contract);
};

const listContracts = async (req, res) => {
  const profile = req.profile;
  const { Contract } = req.app.get("models");
  const contracts = await Contract.findAll({
    where: {
      status: { [Op.ne]: "terminated" },
      ...profileToQuery(profile),
    },
  });
  res.json({ data: contracts });
};

module.exports = {
  getContractById,
  listContracts,
};
