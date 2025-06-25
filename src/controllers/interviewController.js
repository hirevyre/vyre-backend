const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const User = require('../models/User');
const responseUtils = require('../utils/responseUtils');

/**
 * Schedule a new interview
 * @route POST /interviews
 */
exports.scheduleInterview = async (req, res) => {
  try {
    const { candidateId, jobId, interviewers, date, time, duration, location, linkOrAddress, type } = req.body;
    
    // Verify candidate exists
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    });
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    // Verify job exists
    const job = await Job.findOne({
      _id: jobId,
      companyId: req.user.companyId
    });
    
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Create interview
    const interviewData = {
      candidateId,
      jobId,
      companyId: req.user.companyId,
      interviewers,
      date,
      time,
      duration: duration || 60,
      location,
      linkOrAddress,
      type,
      status: 'Scheduled'
    };
    
    const interview = new Interview(interviewData);
    await interview.save();
    
    // Update candidate status to 'Interviewing' if currently 'New'
    if (candidate.status === 'New' || candidate.status === 'Screening') {
      candidate.status = 'Interviewing';
      await candidate.save();
    }
    
    return responseUtils.success(res, 'Interview scheduled successfully', {
      interviewId: interview._id,
      candidateName: `${candidate.firstName} ${candidate.lastName}`,
      jobTitle: job.jobTitle,
      date,
      time
    }, 201);
  } catch (error) {
    console.error('Schedule interview error:', error);
    return responseUtils.error(res, 'Failed to schedule interview', 500);
  }
};

/**
 * Get all interviews
 * @route GET /interviews
 */
exports.getInterviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, dateFrom, dateTo } = req.query;
    
    // Build filters
    const filters = {
      companyId: req.user.companyId
    };
    
    if (status && status !== 'all') {
      filters.status = status;
    }
    
    // Date range filters
    if (dateFrom || dateTo) {
      filters.date = {};
      if (dateFrom) {
        filters.date.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filters.date.$lte = new Date(dateTo);
      }
    }
    
    // Count total interviews
    const total = await Interview.countDocuments(filters);
    
    // Get paginated interviews
    const interviews = await Interview.find(filters)
      .populate('candidateId', 'firstName lastName')
      .populate('jobId', 'jobTitle')
      .sort({ date: 1, time: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format interviews data
    const interviewsData = interviews.map(interview => ({
      id: interview._id,
      candidate: {
        id: interview.candidateId._id,
        name: `${interview.candidateId.firstName} ${interview.candidateId.lastName}`,
        image: '/placeholder.svg',
        initials: `${interview.candidateId.firstName.charAt(0)}${interview.candidateId.lastName.charAt(0)}`
      },
      role: interview.jobId.jobTitle,
      date: interview.date.toISOString().split('T')[0],
      time: interview.time,
      status: interview.status.toLowerCase()
    }));
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      interviews: interviewsData
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    return responseUtils.error(res, 'Failed to get interviews', 500);
  }
};

/**
 * Get interview by ID
 * @route GET /interviews/:interviewId
 */
exports.getInterviewById = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    })
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobTitle')
      .populate('interviewers', 'firstName lastName')
      .populate('feedback.submittedBy', 'firstName lastName');
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    // Format interview data
    const interviewData = {
      id: interview._id,
      candidate: {
        id: interview.candidateId._id,
        name: `${interview.candidateId.firstName} ${interview.candidateId.lastName}`,
        email: interview.candidateId.email,
        image: '/placeholder.svg',
        initials: `${interview.candidateId.firstName.charAt(0)}${interview.candidateId.lastName.charAt(0)}`
      },
      role: interview.jobId.jobTitle,
      jobId: interview.jobId._id,
      date: interview.date.toISOString().split('T')[0],
      time: interview.time,
      duration: `${interview.duration} minutes`,
      status: interview.status.toLowerCase(),
      interviewer: interview.interviewers.length > 0 ? 
        `${interview.interviewers[0].firstName} ${interview.interviewers[0].lastName}` : 
        'Not assigned'
    };
    
    // Add feedback data if available
    if (interview.feedback && interview.feedback.overallScore) {
      interviewData.overallScore = interview.feedback.overallScore;
      interviewData.recommendation = interview.feedback.recommendation;
      interviewData.skills = interview.feedback.skills ? Object.fromEntries(interview.feedback.skills) : {};
      interviewData.transcript = interview.feedback.transcript;
      interviewData.feedback = interview.feedback.feedback;
    }
    
    // Add notes
    if (interview.notes && interview.notes.length > 0) {
      interviewData.notes = interview.notes[0].content;
    }
    
    return responseUtils.success(res, undefined, interviewData);
  } catch (error) {
    console.error('Get interview by ID error:', error);
    return responseUtils.error(res, 'Failed to get interview', 500);
  }
};

/**
 * Update interview
 * @route PUT /interviews/:interviewId
 */
exports.updateInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    });
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    // Don't allow updating candidateId or jobId
    const { candidateId, jobId, ...updateData } = req.body;
    
    Object.keys(updateData).forEach(key => {
      interview[key] = updateData[key];
    });
    
    await interview.save();
    
    return responseUtils.success(res, 'Interview updated successfully', {
      interviewId: interview._id
    });
  } catch (error) {
    console.error('Update interview error:', error);
    return responseUtils.error(res, 'Failed to update interview', 500);
  }
};

/**
 * Update interview status
 * @route PATCH /interviews/:interviewId/status
 */
exports.updateInterviewStatus = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { status } = req.body;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    });
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    interview.status = status;
    await interview.save();
    
    return responseUtils.success(res, 'Interview status updated successfully', {
      interviewId: interview._id,
      status: interview.status
    });
  } catch (error) {
    console.error('Update interview status error:', error);
    return responseUtils.error(res, 'Failed to update interview status', 500);
  }
};

/**
 * Delete interview
 * @route DELETE /interviews/:interviewId
 */
exports.deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    });
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    await interview.deleteOne();
    
    return responseUtils.success(res, 'Interview deleted successfully');
  } catch (error) {
    console.error('Delete interview error:', error);
    return responseUtils.error(res, 'Failed to delete interview', 500);
  }
};

/**
 * Submit interview feedback
 * @route POST /interviews/:interviewId/feedback
 */
exports.submitInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { overallScore, recommendation, skills, feedback, transcript } = req.body;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    });
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    // Update interview feedback
    interview.feedback = {
      overallScore,
      recommendation,
      skills: new Map(Object.entries(skills)),
      feedback,
      transcript,
      submittedBy: req.user.id,
      submittedAt: new Date()
    };
    
    // Update interview status to completed
    interview.status = 'Completed';
    
    await interview.save();
    
    // Update candidate score based on the interview feedback
    const candidate = await Candidate.findById(interview.candidateId);
    if (candidate) {
      candidate.score = overallScore;
      
      // Update candidate status based on recommendation
      if (recommendation === 'Shortlist') {
        candidate.status = 'Shortlisted';
      } else if (recommendation === 'Reject') {
        candidate.status = 'Rejected';
      } else if (recommendation === 'Hire') {
        candidate.status = 'Hired';
      }
      
      await candidate.save();
    }
    
    return responseUtils.success(res, 'Interview feedback submitted successfully', {
      interviewId: interview._id
    });
  } catch (error) {
    console.error('Submit interview feedback error:', error);
    return responseUtils.error(res, 'Failed to submit interview feedback', 500);
  }
};

/**
 * Add notes to interview
 * @route POST /interviews/:interviewId/notes
 */
exports.addInterviewNotes = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { notes } = req.body;
    
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    });
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    // Add note
    const noteObj = {
      content: notes,
      createdBy: req.user.id
    };
    
    interview.notes.push(noteObj);
    await interview.save();
    
    // Get the ID of the new note
    const noteId = interview.notes[interview.notes.length - 1]._id;
    
    return responseUtils.success(res, 'Notes added successfully', {
      noteId,
      interviewId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Add interview notes error:', error);
    return responseUtils.error(res, 'Failed to add notes', 500);
  }
};
