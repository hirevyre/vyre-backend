const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const responseUtils = require('../utils/responseUtils');

/**
 * Create a new candidate
 * @route POST /candidates
 */
exports.createCandidate = async (req, res) => {
  try {
    const { jobId, firstName, lastName, email } = req.body;
    
    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return responseUtils.error(res, 'Job not found', 404);
    }
    
    // Check if candidate with same email already applied for this job
    const existingCandidate = await Candidate.findOne({ email, jobId });
    if (existingCandidate) {
      return responseUtils.error(res, 'Candidate has already applied for this job', 400);
    }
    
    // Create candidate
    const candidateData = {
      ...req.body,
      companyId: job.companyId
    };
    
    const candidate = new Candidate(candidateData);
    await candidate.save();
    
    return responseUtils.success(res, 'Candidate created successfully', {
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email
    }, 201);
  } catch (error) {
    console.error('Create candidate error:', error);
    return responseUtils.error(res, 'Failed to create candidate', 500);
  }
};

/**
 * Get all candidates
 * @route GET /candidates
 */
exports.getCandidates = async (req, res) => {
  try {
    const { jobId, status, page = 1, limit = 10, q } = req.query;
    
    // Build filters
    const filters = {
      companyId: req.user.companyId
    };
    
    if (jobId) {
      filters.jobId = jobId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    if (q) {
      filters.$or = [
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Count total candidates
    const total = await Candidate.countDocuments(filters);
    
    // Get paginated candidates
    const candidates = await Candidate.find(filters)
      .populate('jobId', 'jobTitle')
      .sort({ applyDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    // Format candidates data
    const candidatesData = candidates.map(candidate => ({
      id: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      jobTitle: candidate.jobId ? candidate.jobId.jobTitle : 'Unknown Job',
      status: candidate.status,
      applyDate: candidate.applyDate
    }));
    
    // Build pagination object
    const pagination = responseUtils.getPagination(total, page, limit);
    
    return responseUtils.success(res, undefined, {
      ...pagination,
      candidates: candidatesData
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    return responseUtils.error(res, 'Failed to get candidates', 500);
  }
};

/**
 * Get candidate by ID
 * @route GET /candidates/:candidateId
 */
exports.getCandidateById = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    }).populate('jobId', 'jobTitle');
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    const candidateData = {
      id: candidate._id,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      email: candidate.email,
      phone: candidate.phone,
      resumeUrl: candidate.resumeUrl,
      linkedIn: candidate.linkedIn,
      jobId: candidate.jobId._id,
      jobTitle: candidate.jobId.jobTitle,
      coverLetter: candidate.coverLetter,
      status: candidate.status,
      applyDate: candidate.applyDate,
      lastUpdated: candidate.updatedAt
    };
    
    return responseUtils.success(res, undefined, candidateData);
  } catch (error) {
    console.error('Get candidate by ID error:', error);
    return responseUtils.error(res, 'Failed to get candidate', 500);
  }
};

/**
 * Update candidate
 * @route PUT /candidates/:candidateId
 */
exports.updateCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    });
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    // Update candidate fields (excluding jobId to prevent job transfer)
    const { jobId, ...updateData } = req.body;
    
    Object.keys(updateData).forEach(key => {
      candidate[key] = updateData[key];
    });
    
    await candidate.save();
    
    return responseUtils.success(res, 'Candidate updated successfully', {
      candidateId: candidate._id,
      name: `${candidate.firstName} ${candidate.lastName}`
    });
  } catch (error) {
    console.error('Update candidate error:', error);
    return responseUtils.error(res, 'Failed to update candidate', 500);
  }
};

/**
 * Update candidate status
 * @route PATCH /candidates/:candidateId/status
 */
exports.updateCandidateStatus = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { status, notes } = req.body;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    });
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    candidate.status = status;
    
    // Add note if provided
    if (notes) {
      candidate.notes.push({
        content: notes,
        createdBy: req.user.id
      });
    }
    
    await candidate.save();
    
    return responseUtils.success(res, 'Candidate status updated successfully', {
      candidateId: candidate._id,
      status: candidate.status
    });
  } catch (error) {
    console.error('Update candidate status error:', error);
    return responseUtils.error(res, 'Failed to update candidate status', 500);
  }
};

/**
 * Delete candidate
 * @route DELETE /candidates/:candidateId
 */
exports.deleteCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    });
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    await candidate.deleteOne();
    
    return responseUtils.success(res, 'Candidate deleted successfully');
  } catch (error) {
    console.error('Delete candidate error:', error);
    return responseUtils.error(res, 'Failed to delete candidate', 500);
  }
};

/**
 * Add notes to candidate
 * @route POST /candidates/:candidateId/notes
 */
exports.addCandidateNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { notes } = req.body;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    });
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    // Add note
    const noteObj = {
      content: notes,
      createdBy: req.user.id
    };
    
    candidate.notes.push(noteObj);
    await candidate.save();
    
    // Get the ID of the new note
    const noteId = candidate.notes[candidate.notes.length - 1]._id;
    
    return responseUtils.success(res, 'Notes added successfully', {
      noteId,
      candidateId,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Add candidate notes error:', error);
    return responseUtils.error(res, 'Failed to add notes', 500);
  }
};

/**
 * Get candidate notes
 * @route GET /candidates/:candidateId/notes
 */
exports.getCandidateNotes = async (req, res) => {
  try {
    const { candidateId } = req.params;
    
    const candidate = await Candidate.findOne({
      _id: candidateId,
      companyId: req.user.companyId
    }).populate('notes.createdBy', 'firstName lastName');
    
    if (!candidate) {
      return responseUtils.error(res, 'Candidate not found', 404);
    }
    
    // Format notes data
    const notesData = candidate.notes.map(note => ({
      id: note._id,
      content: note.content,
      createdBy: note.createdBy._id,
      createdByName: `${note.createdBy.firstName} ${note.createdBy.lastName}`,
      createdAt: note.createdAt
    }));
    
    return responseUtils.success(res, undefined, {
      notes: notesData
    });
  } catch (error) {
    console.error('Get candidate notes error:', error);
    return responseUtils.error(res, 'Failed to get notes', 500);
  }
};
