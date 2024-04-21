function profileToQuery(profile) {
  return profile.type === "client"
    ? { ClientId: profile.id }
    : { ContractorId: profile.id };
}

module.exports = {
  profileToQuery,
};
