function JobNotFound(jobId) {
  this.message = `Job '${jobId}' not found.`;
}
JobNotFound.prototype = new Error();

module.exports = JobNotFound;
