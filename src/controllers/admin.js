const bestProfession = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ message: "Both start and end dates are required." })
      .end();
  }

  const startTime = new Date(start);
  const endTime = new Date(end);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return res
      .status(400)
      .json({
        message:
          "Invalid date format. Please provide dates in valid format yyyy-MM-dd.",
      })
      .end();
  }

  if (startTime > endTime) {
    return res
      .status(400)
      .json({ message: "Start date cannot be after end date." })
      .end();
  }

  const sequelize = req.app.get("sequelize");

  const profession = await sequelize.query(
    `
    SELECT 
      p.profession, SUM(j.price) AS totalEarned
    FROM 
      Profiles p
    INNER JOIN 
      Contracts c ON p.id = c.ContractorId
    INNER JOIN 
      Jobs j ON c.id = j.ContractId
    WHERE 
      j.paid = true 
      AND DATE(j.paymentDate) BETWEEN :startTime AND :endTime
    GROUP BY 
      p.profession
    ORDER BY 
      totalEarned DESC
    LIMIT 1 
    `,
    {
      replacements: {
        startTime: startTime.toISOString().split("T")[0],
        endTime: endTime.toISOString().split("T")[0],
      },
      plain: true,
      type: sequelize.QueryTypes.SELECT,
    }
  );

  if (!profession) {
    return res
      .status(404)
      .json({
        message: "No profession earned money within the specified date range.",
      })
      .end();
  }

  res.json({ ...profession });
};

const bestClients = async (req, res) => {
  const { start, end, limit } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ message: "Both start and end dates are required." })
      .end();
  }

  const startTime = new Date(start);
  const endTime = new Date(end);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return res
      .status(400)
      .json({
        message:
          "Invalid date format. Please provide dates in valid format yyyy-MM-dd.",
      })
      .end();
  }

  if (startTime > endTime) {
    return res
      .status(400)
      .json({ message: "Start date cannot be after end date." })
      .end();
  }

  const sequelize = req.app.get("sequelize");

  const clients = await sequelize.query(
    `
    SELECT 
       p.id, CONCAT(p.firstName, ' ', p.lastName) AS fullName, SUM(j.price) AS paid
    FROM 
      Profiles p
    INNER JOIN 
      Contracts c ON p.id = c.ClientId
    INNER JOIN 
      Jobs j ON c.id = j.ContractId
    WHERE 
      j.paid = true 
      AND DATE(j.paymentDate) BETWEEN :startTime AND :endTime
    GROUP BY 
      p.firstName, p.lastName
    ORDER BY 
      paid DESC
    LIMIT :limit
    `,
    {
      replacements: {
        startTime: startTime.toISOString().split("T")[0],
        endTime: endTime.toISOString().split("T")[0],
        limit: limit || 2,
      },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  res.json({
    data: clients.map((result) => ({
      id: result.id,
      fullName: result.fullName,
      paid: result.paid,
    })),
  });
};

module.exports = {
  bestProfession,
  bestClients,
};
