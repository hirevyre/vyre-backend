const Company = require('../models/Company');
const responseUtils = require('../utils/responseUtils');

/**
 * Get company settings
 * @route GET /settings/company
 */
exports.getCompanySettings = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    const settings = {
      companyName: company.name,
      description: company.description,
      logo: company.logo,
      website: company.website,
      industry: company.industry,
      size: company.size,
      location: company.location
    };
    
    return responseUtils.success(res, undefined, settings);
  } catch (error) {
    console.error('Get company settings error:', error);
    return responseUtils.error(res, 'Failed to get company settings', 500);
  }
};

/**
 * Update company settings
 * @route PUT /settings/company
 */
exports.updateCompanySettings = async (req, res) => {
  try {
    // Only admin can update company settings
    if (req.user.role !== 'admin') {
      return responseUtils.error(res, 'Only admins can update company settings', 403);
    }
    
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    // Update fields
    const { companyName, description, website, industry, size, location } = req.body;
    
    if (companyName) company.name = companyName;
    if (description) company.description = description;
    if (website) company.website = website;
    if (industry) company.industry = industry;
    if (size) company.size = size;
    if (location) company.location = location;
    
    await company.save();
    
    return responseUtils.success(res, 'Company settings updated successfully');
  } catch (error) {
    console.error('Update company settings error:', error);
    return responseUtils.error(res, 'Failed to update company settings', 500);
  }
};

/**
 * Get interview preferences
 * @route GET /settings/interview-preferences
 */
exports.getInterviewPreferences = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    const preferences = company.settings?.interviewPreferences || {
      defaultDuration: 60,
      defaultLocation: 'Virtual'
    };
    
    return responseUtils.success(res, undefined, preferences);
  } catch (error) {
    console.error('Get interview preferences error:', error);
    return responseUtils.error(res, 'Failed to get interview preferences', 500);
  }
};

/**
 * Update interview preferences
 * @route PUT /settings/interview-preferences
 */
exports.updateInterviewPreferences = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    const { defaultDuration, defaultLocation } = req.body;
    
    if (!company.settings) {
      company.settings = {};
    }
    
    if (!company.settings.interviewPreferences) {
      company.settings.interviewPreferences = {};
    }
    
    if (defaultDuration) {
      company.settings.interviewPreferences.defaultDuration = defaultDuration;
    }
    
    if (defaultLocation) {
      company.settings.interviewPreferences.defaultLocation = defaultLocation;
    }
    
    await company.save();
    
    return responseUtils.success(res, 'Interview preferences updated successfully');
  } catch (error) {
    console.error('Update interview preferences error:', error);
    return responseUtils.error(res, 'Failed to update interview preferences', 500);
  }
};

/**
 * Get notification preferences
 * @route GET /settings/notification-preferences
 */
exports.getNotificationPreferences = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    const preferences = company.settings?.notificationPreferences || {
      email: {
        newApplicant: true,
        interviewScheduled: true,
        interviewCompleted: true
      }
    };
    
    return responseUtils.success(res, undefined, preferences);
  } catch (error) {
    console.error('Get notification preferences error:', error);
    return responseUtils.error(res, 'Failed to get notification preferences', 500);
  }
};

/**
 * Update notification preferences
 * @route PUT /settings/notification-preferences
 */
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId);
    
    if (!company) {
      return responseUtils.error(res, 'Company not found', 404);
    }
    
    const { email } = req.body;
    
    if (!company.settings) {
      company.settings = {};
    }
    
    if (!company.settings.notificationPreferences) {
      company.settings.notificationPreferences = {};
    }
    
    if (email) {
      company.settings.notificationPreferences.email = {
        ...company.settings.notificationPreferences.email,
        ...email
      };
    }
    
    await company.save();
    
    return responseUtils.success(res, 'Notification preferences updated successfully');
  } catch (error) {
    console.error('Update notification preferences error:', error);
    return responseUtils.error(res, 'Failed to update notification preferences', 500);
  }
};
