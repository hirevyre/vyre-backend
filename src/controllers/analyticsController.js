const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const Interview = require('../models/Interview');
const Report = require('../models/Report');
const responseUtils = require('../utils/responseUtils');
const mongoose = require('mongoose');
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

/**
 * Get activity summary for a specific period
 * @route GET /analytics/activity-summary
 */
exports.getActivitySummary = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const userId = req.user.id;
    const companyId = req.user.companyId;
    
    // Define the start date based on period
    let startDate = new Date();
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1); // Default to month
    }
    
    // Get the job model to access jobs data
    const Job = require('../models/Job');
    const Candidate = require('../models/Candidate');
    const Interview = require('../models/Interview');
    const User = require('../models/User');
    
    // Gather data for activity summary
    const [
      newJobs,
      newCandidates,
      scheduledInterviews,
      completedInterviews,
      activeUsers,
      // Daily activity breakdown
      jobsData,
      candidatesData,
      interviewsData
    ] = await Promise.all([
      // Count of new jobs in period
      Job.countDocuments({
        companyId,
        createdAt: { $gte: startDate }
      }),
      
      // Count of new candidates in period
      Candidate.countDocuments({
        companyId,
        createdAt: { $gte: startDate }
      }),
      
      // Count of scheduled interviews in period
      Interview.countDocuments({
        companyId,
        scheduledDate: { $gte: startDate },
        status: 'scheduled'
      }),
      
      // Count of completed interviews in period
      Interview.countDocuments({
        companyId,
        completedDate: { $gte: startDate },
        status: 'completed'
      }),
      
      // Count of active users in period
      User.countDocuments({
        companyId,
        lastActive: { $gte: startDate }
      }),
      
      // Jobs created per day in the period
      Job.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]),
      
      // Candidates added per day in the period
      Candidate.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ]),
      
      // Interviews scheduled per day in the period
      Interview.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(companyId),
            scheduledDate: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$scheduledDate" } },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id": 1 }
        }
      ])
    ]);
    
    // Format the daily activity data
    const dailyActivity = formatDailyActivityData(startDate, jobsData, candidatesData, interviewsData);
    
    return responseUtils.success(res, 'Activity summary retrieved successfully', {
      summary: {
        newJobs,
        newCandidates,
        scheduledInterviews,
        completedInterviews,
        activeUsers,
        period
      },
      dailyActivity
    });
  } catch (error) {
    console.error('Error getting activity summary:', error);
    return responseUtils.error(res, 'Failed to retrieve activity summary', 500);
  }
};

/**
 * Get recruitment source effectiveness
 * @route GET /analytics/source-effectiveness
 */
exports.getSourceEffectiveness = async (req, res) => {
  try {
    const { timeRange = '30' } = req.query; // Days
    const userId = req.user.id;
    const companyId = req.user.companyId;
    
    const daysAgo = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    
    const Candidate = require('../models/Candidate');
    
    // Aggregate candidates by source and count them
    const sourceData = await Candidate.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$source",
          totalCandidates: { $sum: 1 },
          interviewed: {
            $sum: { $cond: [{ $gt: ["$interviewCount", 0] }, 1, 0] }
          },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          source: "$_id",
          totalCandidates: 1,
          interviewed: 1,
          hired: 1,
          rejected: 1,
          interviewRate: { 
            $round: [{ $multiply: [{ $divide: ["$interviewed", "$totalCandidates"] }, 100] }, 1] 
          },
          hireRate: { 
            $round: [{ $multiply: [{ $divide: ["$hired", "$totalCandidates"] }, 100] }, 1] 
          },
          _id: 0
        }
      },
      {
        $sort: { totalCandidates: -1 }
      }
    ]);
    
    // Add default sources if none exist
    const formattedSourceData = formatSourceData(sourceData);
    
    return responseUtils.success(res, 'Source effectiveness retrieved successfully', {
      timeRange: parseInt(timeRange),
      sources: formattedSourceData
    });
  } catch (error) {
    console.error('Error getting source effectiveness:', error);
    return responseUtils.error(res, 'Failed to retrieve source effectiveness', 500);
  }
};

// Helper function to format daily activity data
function formatDailyActivityData(startDate, jobsData, candidatesData, interviewsData) {
  // Create a map of dates to ensure we have entries for every day
  const dailyMap = {};
  
  const currentDate = new Date();
  let day = new Date(startDate);
  
  // Initialize the map with all dates in the range
  while (day <= currentDate) {
    const dateStr = day.toISOString().split('T')[0];
    dailyMap[dateStr] = {
      date: dateStr,
      jobs: 0,
      candidates: 0,
      interviews: 0
    };
    day.setDate(day.getDate() + 1);
  }
  
  // Fill in actual job data
  jobsData.forEach(item => {
    if (dailyMap[item._id]) {
      dailyMap[item._id].jobs = item.count;
    }
  });
  
  // Fill in actual candidate data
  candidatesData.forEach(item => {
    if (dailyMap[item._id]) {
      dailyMap[item._id].candidates = item.count;
    }
  });
  
  // Fill in actual interview data
  interviewsData.forEach(item => {
    if (dailyMap[item._id]) {
      dailyMap[item._id].interviews = item.count;
    }
  });
  
  // Convert map to array for response
  return Object.values(dailyMap);
}

// Helper function to format source data
function formatSourceData(sourceData) {
  // If no sources found, add some default ones
  if (sourceData.length === 0) {
    return [
      {
        source: 'LinkedIn',
        totalCandidates: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
        interviewRate: 0,
        hireRate: 0
      },
      {
        source: 'Indeed',
        totalCandidates: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
        interviewRate: 0,
        hireRate: 0
      },
      {
        source: 'Referral',
        totalCandidates: 0,
        interviewed: 0,
        hired: 0,
        rejected: 0,
        interviewRate: 0,
        hireRate: 0
      }
    ];
  }
  
  // Handle null or undefined source values
  return sourceData.map(item => ({
    ...item,
    source: item.source || 'Direct Application'
  }));
}
