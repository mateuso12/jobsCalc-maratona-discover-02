const Job = require("../model/Job")
const JobUtils = require("../utils/JobUtils")
const Profile = require("../model/Profile")

module.exports = {
  async index(req, res) {
  const jobs = await Job.get();
  const profile = await Profile.get();

  let jobTotalHours = 0;

  let statusCount = {
    progress: 0,
    done: 0,
    total: jobs.length
  }

  const updatedJobs = jobs.map(job => {
    // ajustes no job
    const remaining = JobUtils.remainingDays(job);
    const status = remaining <= 0 ? "done" : "progress";

    // Total de horas por dia em cada job em progresso
    jobTotalHours = status == 'progress' ? jobTotalHours + Number(job['daily-hours']) : jobTotalHours;

    // Somando a quantidade de status
    statusCount[status] += 1;

    return {
      ...job,
      remaining,
      status,
      budget: JobUtils.calculateBudget(job, profile["value-hour"]),
    };
  });

  let freeHours = profile['hours-per-day'] - jobTotalHours;

  return res.render("index", { jobs: updatedJobs, profile: profile, statusCount: statusCount, freeHours: freeHours });
}}