const Job = require('../models/Job');
const Candidate = require('../models/Candidate');
const responseUtils = require('../utils/responseUtils');

/**
 * Create a new job
 * @route POST /jobs
 */
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      companyId: req.user.companyId,
      createdBy: req.user.id
    };
    
    const job = new Job(jobData);
    await job.save();
    
    return responseUtils.success(res, 'Job created successfully', {
      jobId: job._id,
      jobTitle: job.jobTitle,
      status: job.status,
      createdDate: job.createdAt
    }, 201);
  } catch (error) {
    console.error('Create job error:', error);
    return responseUtils.error(res, 'Failed to create job', 500);
  }
};

/**
 * Get all jobs
 * @route GET /jobs
 */
exports.getJobs = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, q, sort = 'createdAt', order = 'desc' } = req.query;
    
    // Build filters
    const filters = {
      companyId: req.user.companyId
    };
    
    if (status) {
      filters.status = status;
    }
    
    if (q) {
      filters.$or = [
        { jobTitle: { $regex: q, $options: 'i' } },
        { department: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;
    
    // Count total jobs
    const total = await Job.countDocuments(filters);
    
    // Get paginated jobs
    const jobs = await Job.find(filters)
      .populate('createdBy', 'firstName lastName')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    // Get job IDs for counting applicants
    const jobIds = jobs.map(job => job._id);
    
    // Count applicants for each job
    const applicantCounts = await Candidate.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    
    // Map applicant counts to jobs
    const jobsWithApplicants = jobs.map(job => {
      const applicantData = applicantCounts.find(item => item._id.toString() === job._id.toString());
      return {
        id: job._id,
        title: job.jobTitle,
        department: job.department,
        status: job.status,
        createdDate: job.createdAt,
        applicants: applicantData ? applicantData.count : 0,
        interviewsDone: 0 // This would need another query to count interviews
      };
    });
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      jobs: jobsWithApplicants
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    return responseUtils.error(res, 'Failed to get jobs', 500);
  }
};

/**
 * Get job by ID
 * @route GET /jobs/:jobId
 */
exports.getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Count applicants
    const applicantCount = await Candidate.countDocuments({ jobId: job._id });
    
    // Count interviews done (would need to join with Interview model)
    const interviewsDone = 0; // This would need another query to count interviews
    
    const jobData = {
      id: job._id,
      title: job.jobTitle,
      department: job.department,
      experienceLevel: job.experienceLevel,
      employmentType: job.employmentType,
      location: job.location,
      salaryRange: job.salaryRange,
      startDate: job.startDate,
      skills: job.skills,
      jobDescription: job.jobDescription,
      screeningQuestions: job.screeningQuestions,
      status: job.status,
      createdDate: job.createdAt,
      applicants: applicantCount,
      interviewsDone: interviewsDone,
      internalNotes: job.internalNotes,
      publishOptions: job.publishOptions
    };
    
    return responseUtils.success(res, undefined, jobData);
  } catch (error) {
    console.error('Get job by ID error:', error);
    return responseUtils.error(res, 'Failed to get job', 500);
  }
};

/**
 * Update job
 * @route PUT /jobs/:jobId
 */
exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Update job fields
    Object.keys(req.body).forEach(key => {
      job[key] = req.body[key];
    });
    
    await job.save();
    
    return responseUtils.success(res, 'Job updated successfully', {
      jobId: job._id,
      jobTitle: job.jobTitle,
      status: job.status
    });
  } catch (error) {
    console.error('Update job error:', error);
    return responseUtils.error(res, 'Failed to update job', 500);
  }
};

/**
 * Update job status
 * @route PATCH /jobs/:jobId/status
 */
exports.updateJobStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status } = req.body;
    
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    job.status = status;
    await job.save();
    
    return responseUtils.success(res, 'Job status updated successfully', {
      jobId: job._id,
      status: job.status
    });
  } catch (error) {
    console.error('Update job status error:', error);
    return responseUtils.error(res, 'Failed to update job status', 500);
  }
};

/**
 * Delete job
 * @route DELETE /jobs/:jobId
 */
exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    await job.deleteOne();
    
    return responseUtils.success(res, 'Job deleted successfully');
  } catch (error) {
    console.error('Delete job error:', error);
    return responseUtils.error(res, 'Failed to delete job', 500);
  }
};

/**
 * Get job applicants
 * @route GET /jobs/:jobId/applicants
 */
exports.getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    // Check if job exists
    const jobExists = await Job.exists({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!jobExists) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Build filters
    const filters = {
      jobId,
      companyId: req.user.companyId
    };
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    // Count total applicants
    const total = await Candidate.countDocuments(filters);
    
    // Get paginated applicants
    const applicants = await Candidate.find(filters)
      .sort({ applyDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format applicants data
    const applicantsData = applicants.map(applicant => ({
      id: applicant._id,
      name: `${applicant.firstName} ${applicant.lastName}`,
      email: applicant.email,
      applyDate: applicant.applyDate,
      status: applicant.status,
      score: applicant.score
    }));
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      applicants: applicantsData
    });
  } catch (error) {
    console.error('Get job applicants error:', error);
    return responseUtils.error(res, 'Failed to get applicants', 500);
  }
};
