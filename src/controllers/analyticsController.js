const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const responseUtils = require('../utils/responseUtils');

/**
 * Get dashboard analytics
 * @route GET /analytics/dashboard
 */
exports.getDashboardAnalytics = async (req, res) => {
  try {
    console.log(`Getting dashboard analytics for company: ${req.user.companyId}`);
    
    // Count total jobs
    const totalJobs = await Job.countDocuments({ companyId: req.user.companyId });
    
    // Count total candidates
    const totalCandidates = await Candidate.countDocuments({ companyId: req.user.companyId });
    
    // Count completed interviews
    const interviewsCompleted = await Interview.countDocuments({
      companyId: req.user.companyId,
      status: 'Completed'
    });
    
    // Count shortlisted candidates
    const candidatesShortlisted = await Candidate.countDocuments({
      companyId: req.user.companyId,
      status: 'Shortlisted'
    });
    
    // Get latest jobs
    const latestJobs = await Job.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    // Get latest candidates
    const latestCandidates = await Candidate.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    console.log(`Dashboard analytics retrieved successfully. Jobs: ${totalJobs}, Candidates: ${totalCandidates}`);
    
    return responseUtils.success(res, undefined, {
      totalJobs,
      totalCandidates,
      interviewsCompleted,
      candidatesShortlisted,
      latestJobs,
      latestCandidates
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    return responseUtils.error(res, 'Failed to get analytics', 500);
  }
};

/**
 * Get dashboard stats - identical to dashboard analytics for now
 * @route GET /analytics/dashboard-stats
 */
exports.getDashboardStats = exports.getDashboardAnalytics;

/**
 * Get recruitment analytics
 * @route GET /analytics/recruitment
 */
exports.getRecruitmentAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate time range
    let startDate;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'month':
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    
    // Get candidates hired in period
    const hiredCandidates = await Candidate.find({
      companyId: req.user.companyId,
      status: 'Hired',
      updatedAt: { $gte: startDate, $lte: endDate }
    }).lean();
    
    // Calculate average time to hire (difference between apply date and hire date)
    let totalHireDays = 0;
    hiredCandidates.forEach(candidate => {
      const applyDate = new Date(candidate.applyDate);
      const hireDate = new Date(candidate.updatedAt);
      const daysDiff = Math.round((hireDate - applyDate) / (1000 * 60 * 60 * 24));
      totalHireDays += daysDiff;
    });
    
    const timeToHire = {
      average: hiredCandidates.length > 0 ? Math.round(totalHireDays / hiredCandidates.length) : 0,
      trend: -12 // Mock trend data, would be calculated in real app
    };
    
    // Get average candidate score
    const candidates = await Candidate.find({
      companyId: req.user.companyId,
      score: { $exists: true, $ne: null }
    }).lean();
    
    const totalScore = candidates.reduce((sum, candidate) => sum + (candidate.score || 0), 0);
    const candidateScore = {
      average: candidates.length > 0 ? Math.round(totalScore / candidates.length) : 0,
      trend: 4 // Mock trend data, would be calculated in real app
    };
    
    // Get most sourced role
    const jobCounts = await Candidate.aggregate([
      { $match: { companyId: req.user.companyId } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    
    let mostSourcedRole = {
      title: "Not available",
      count: 0
    };
    
    if (jobCounts.length > 0) {
      const job = await Job.findById(jobCounts[0]._id).lean();
      if (job) {
        mostSourcedRole = {
          title: job.jobTitle,
          count: jobCounts[0].count
        };
      }
    }
    
    // Mock monthly activity data
    const activityData = [
      { month: 'Jan', hires: 5 },
      { month: 'Feb', hires: 8 },
      { month: 'Mar', hires: 12 },
      { month: 'Apr', hires: 10 },
      { month: 'May', hires: 15 },
      { month: 'Jun', hires: 9 }
    ];
    
    // Mock role data
    const roleData = [
      { name: 'Frontend Dev', value: 32 },
      { name: 'Backend Dev', value: 28 },
      { name: 'UI/UX Designer', value: 15 },
      { name: 'Product Manager', value: 12 },
      { name: 'QA Engineer', value: 8 }
    ];
    
    return responseUtils.success(res, undefined, {
      timeToHire,
      candidateScore,
      interviewToHireRatio: '1:6',
      trendImprovement: -8,
      mostSourcedRole,
      activityData,
      roleData
    });
  } catch (error) {
    console.error('Get recruitment analytics error:', error);
    return responseUtils.error(res, 'Failed to get analytics', 500);
  }
};

/**
 * Get job analytics
 * @route GET /analytics/jobs/:jobId
 */
exports.getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify job exists
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Count applications
    const applications = await Candidate.countDocuments({ jobId });
    
    // Count interviews scheduled
    const interviewsScheduled = await Interview.countDocuments({
      jobId,
      status: { $in: ['Scheduled', 'Completed'] }
    });
    
    // Count interviews completed
    const interviewsCompleted = await Interview.countDocuments({
      jobId,
      status: 'Completed'
    });
    
    // Count shortlisted candidates
    const shortlisted = await Candidate.countDocuments({
      jobId,
      status: 'Shortlisted'
    });
    
    // Count rejected candidates
    const rejected = await Candidate.countDocuments({
      jobId,
      status: 'Rejected'
    });
    
    // Mock time to fill data (days from job creation to hiring)
    const timeToFill = 21;
    
    // Mock candidate source breakdown
    const candidateSourceBreakdown = [
      { source: 'LinkedIn', count: 12 },
      { source: 'Company Website', count: 8 },
      { source: 'Indeed', count: 4 }
    ];
    
    // Mock skills match data
    const skillsMatch = job.skills.map(skill => ({
      skill,
      match: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
    }));
    
    return responseUtils.success(res, undefined, {
      applications,
      interviewsScheduled,
      interviewsCompleted,
      shortlisted,
      rejected,
      timeToFill,
      candidateSourceBreakdown,
      skillsMatch
    });
  } catch (error) {
    console.error('Get job analytics error:', error);
    return responseUtils.error(res, 'Failed to get job analytics', 500);
  }
};
