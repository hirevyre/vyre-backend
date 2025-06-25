const Report = require('../models/Report');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const responseUtils = require('../utils/responseUtils');

/**
 * Generate a new report
 * @route POST /reports
 */
exports.generateReport = async (req, res) => {
  try {
    const { interviewId, includeTranscript } = req.body;
    
    // Verify interview exists and has feedback
    const interview = await Interview.findOne({
      _id: interviewId,
      companyId: req.user.companyId
    }).populate('candidateId').populate('jobId');
    
    if (!interview) {
      return responseUtils.error(res, 'Interview not found', 404);
    }
    
    if (!interview.feedback || !interview.feedback.overallScore) {
      return responseUtils.error(res, 'Interview feedback not submitted yet', 400);
    }
    
    // Calculate JD fit score (this would be more sophisticated in a real app)
    const jdFitScore = Math.round(interview.feedback.overallScore * 0.9 + Math.random() * 10);
    
    // Extract skills from feedback
    const skillsMap = interview.feedback.skills;
    const softSkills = new Map();
    const hardSkills = new Map();
    
    // Simple classification of skills (would be more sophisticated in a real app)
    for (const [skill, score] of skillsMap.entries()) {
      if (['communication', 'teamwork', 'leadership', 'adaptability', 'problemSolving'].includes(skill)) {
        softSkills.set(skill, score);
      } else {
        hardSkills.set(skill, score);
      }
    }
    
    // Create report
    const reportData = {
      interviewId,
      candidateId: interview.candidateId._id,
      jobId: interview.jobId._id,
      companyId: req.user.companyId,
      overallScore: interview.feedback.overallScore,
      jdFitScore,
      result: interview.feedback.recommendation,
      skills: {
        softSkills,
        hardSkills
      },
      summary: `${interview.candidateId.firstName} is a ${interview.feedback.recommendation === 'Shortlist' ? 'strong' : 
                interview.feedback.recommendation === 'Hire' ? 'excellent' : 'potential'} candidate with ${interview.feedback.overallScore > 80 ? 'impressive' : 'good'} skills.`,
      feedback: interview.feedback.feedback,
      strengths: ['Strong technical expertise', 'Excellent communication skills'],
      areasForImprovement: ['Could benefit from more experience in specific domain'],
      transcript: includeTranscript ? interview.feedback.transcript : undefined,
      generatedBy: req.user.id
    };
    
    const report = new Report(reportData);
    await report.save();
    
    return responseUtils.success(res, 'Report generated successfully', {
      reportId: report._id
    }, 201);
  } catch (error) {
    console.error('Generate report error:', error);
    return responseUtils.error(res, 'Failed to generate report', 500);
  }
};

/**
 * Get all reports
 * @route GET /reports
 */
exports.getReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, q } = req.query;
    
    // Build filters
    const filters = {
      companyId: req.user.companyId
    };
    
    // Search functionality
    if (q) {
      // This would need to be implemented with a join/lookup in a real app
      // For now, we'll just search in the reports collection
    }
    
    // Count total reports
    const total = await Report.countDocuments(filters);
    
    // Get paginated reports
    const reports = await Report.find(filters)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobTitle')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format reports data
    const reportsData = reports.map(report => ({
      id: report._id,
      candidate: {
        name: `${report.candidateId.firstName} ${report.candidateId.lastName}`,
        email: report.candidateId.email
      },
      role: report.jobId.jobTitle,
      interviewDate: report.createdAt.toISOString().split('T')[0],
      result: report.result,
      score: report.overallScore
    }));
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      reports: reportsData
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return responseUtils.error(res, 'Failed to get reports', 500);
  }
};

/**
 * Get report by ID
 * @route GET /reports/:reportId
 */
exports.getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    
    const report = await Report.findOne({
      _id: reportId,
      companyId: req.user.companyId
    })
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobTitle');
    
    if (!report) {
      return responseUtils.error(res, 'Report not found', 404);
    }
    
    // Format report data
    const reportData = {
      id: report._id,
      candidate: {
        name: `${report.candidateId.firstName} ${report.candidateId.lastName}`,
        email: report.candidateId.email,
        image: '/placeholder.svg',
        initials: `${report.candidateId.firstName.charAt(0)}${report.candidateId.lastName.charAt(0)}`
      },
      role: report.jobId.jobTitle,
      interviewDate: report.createdAt.toISOString().split('T')[0],
      result: report.result,
      overallScore: report.overallScore,
      jdFitScore: report.jdFitScore,
      skills: {
        softSkills: Object.fromEntries(report.skills.softSkills),
        hardSkills: Object.fromEntries(report.skills.hardSkills)
      },
      summary: report.summary,
      feedback: report.feedback,
      strengths: report.strengths,
      areasForImprovement: report.areasForImprovement
    };
    
    if (report.transcript) {
      reportData.transcript = report.transcript;
    }
    
    return responseUtils.success(res, undefined, reportData);
  } catch (error) {
    console.error('Get report by ID error:', error);
    return responseUtils.error(res, 'Failed to get report', 500);
  }
};

/**
 * Add notes to report
 * @route POST /reports/:reportId/notes
 */
exports.addReportNotes = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { notes } = req.body;
    
    const report = await Report.findOne({
      _id: reportId,
      companyId: req.user.companyId
    });
    
    if (!report) {
      return responseUtils.error(res, 'Report not found', 404);
    }
    
    // Add note
    const noteObj = {
      content: notes,
      createdBy: req.user.id
    };
    
    report.notes.push(noteObj);
    await report.save();
    
    // Get the ID of the new note
    const noteId = report.notes[report.notes.length - 1]._id;
    
    return responseUtils.success(res, 'Notes added successfully', {
      noteId,
      reportId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Add report notes error:', error);
    return responseUtils.error(res, 'Failed to add notes', 500);
  }
};
