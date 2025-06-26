// CompanySettings.jsx - Example React component for company settings
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // Adjust import path as needed

const API_URL = 'https://api.vyre.io/v1';

const CompanySettings = () => {
  // State for different setting types
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
  });
  const [interviewPrefs, setInterviewPrefs] = useState({
    defaultDuration: 60,
    defaultLocation: 'Virtual',
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: {
      newApplicant: true,
      interviewScheduled: true,
      interviewCompleted: true,
    },
  });

  // UI state
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState({
    company: false,
    interview: false,
    notification: false,
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get auth token from context
  const { accessToken, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Fetch all settings on component mount
  useEffect(() => {
    fetchCompanySettings();
    fetchInterviewPreferences();
    fetchNotificationPreferences();
  }, []);

  // Company Settings API calls
  const fetchCompanySettings = async () => {
    try {
      setLoading(prev => ({ ...prev, company: true }));
      const response = await axios.get(`${API_URL}/settings/company`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setCompanySettings(response.data.data);
    } catch (err) {
      setError(`Error loading company settings: ${err.response?.data?.message || err.message}`);
      console.error('Failed to fetch company settings:', err);
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  };

  const updateCompanySettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, company: true }));
      setSuccess(null);
      setError(null);
      
      await axios.put(`${API_URL}/settings/company`, companySettings, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Company settings updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to update company settings: ${err.response?.data?.message || err.message}`);
      console.error('Error updating company settings:', err);
    } finally {
      setLoading(prev => ({ ...prev, company: false }));
    }
  };

  // Interview Preferences API calls
  const fetchInterviewPreferences = async () => {
    try {
      setLoading(prev => ({ ...prev, interview: true }));
      const response = await axios.get(`${API_URL}/settings/interview-preferences`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setInterviewPrefs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch interview preferences:', err);
    } finally {
      setLoading(prev => ({ ...prev, interview: false }));
    }
  };

  const updateInterviewPreferences = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, interview: true }));
      setSuccess(null);
      setError(null);
      
      await axios.put(`${API_URL}/settings/interview-preferences`, interviewPrefs, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Interview preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to update interview preferences: ${err.response?.data?.message || err.message}`);
      console.error('Error updating interview preferences:', err);
    } finally {
      setLoading(prev => ({ ...prev, interview: false }));
    }
  };

  // Notification Preferences API calls
  const fetchNotificationPreferences = async () => {
    try {
      setLoading(prev => ({ ...prev, notification: true }));
      const response = await axios.get(`${API_URL}/settings/notification-preferences`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setNotificationPrefs(response.data.data);
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err);
    } finally {
      setLoading(prev => ({ ...prev, notification: false }));
    }
  };

  const updateNotificationPreferences = async (e) => {
    e.preventDefault();
    try {
      setLoading(prev => ({ ...prev, notification: true }));
      setSuccess(null);
      setError(null);
      
      await axios.put(`${API_URL}/settings/notification-preferences`, notificationPrefs, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Notification preferences updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to update notification preferences: ${err.response?.data?.message || err.message}`);
      console.error('Error updating notification preferences:', err);
    } finally {
      setLoading(prev => ({ ...prev, notification: false }));
    }
  };

  // Event handlers
  const handleCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings(prev => ({ ...prev, [name]: value }));
  };

  const handleInterviewPrefsChange = (e) => {
    const { name, value } = e.target;
    setInterviewPrefs(prev => ({ ...prev, [name]: value }));
  };

  const handleNotificationToggle = (field) => {
    setNotificationPrefs(prev => ({
      email: {
        ...prev.email,
        [field]: !prev.email[field]
      }
    }));
  };

  return (
    <div className="settings-container">
      <h1>Company Settings</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="settings-tabs">
        <button 
          className={`tab ${activeTab === 'company' ? 'active' : ''}`}
          onClick={() => setActiveTab('company')}
        >
          Company Information
        </button>
        <button 
          className={`tab ${activeTab === 'interview' ? 'active' : ''}`}
          onClick={() => setActiveTab('interview')}
        >
          Interview Preferences
        </button>
        <button 
          className={`tab ${activeTab === 'notification' ? 'active' : ''}`}
          onClick={() => setActiveTab('notification')}
        >
          Notification Settings
        </button>
      </div>
      
      <div className="tab-content">
        {/* Company Information Tab */}
        {activeTab === 'company' && (
          <form onSubmit={updateCompanySettings} className="settings-form">
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={companySettings.companyName || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Company Description</label>
              <textarea
                id="description"
                name="description"
                value={companySettings.description || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="website">Website</label>
              <input
                type="url"
                id="website"
                name="website"
                value={companySettings.website || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={companySettings.industry || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="size">Company Size</label>
              <select
                id="size"
                name="size"
                value={companySettings.size || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
              >
                <option value="">Select company size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501-1000">501-1000 employees</option>
                <option value="1001-5000">1001-5000 employees</option>
                <option value="5000+">5000+ employees</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={companySettings.location || ''}
                onChange={handleCompanyInputChange}
                disabled={!isAdmin}
              />
            </div>
            
            {isAdmin ? (
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading.company}
              >
                {loading.company ? 'Saving...' : 'Save Changes'}
              </button>
            ) : (
              <p className="admin-notice">Only admin users can edit company information.</p>
            )}
          </form>
        )}
        
        {/* Interview Preferences Tab */}
        {activeTab === 'interview' && (
          <form onSubmit={updateInterviewPreferences} className="settings-form">
            <div className="form-group">
              <label htmlFor="defaultDuration">Default Interview Duration (minutes)</label>
              <select
                id="defaultDuration"
                name="defaultDuration"
                value={interviewPrefs.defaultDuration || 60}
                onChange={handleInterviewPrefsChange}
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="defaultLocation">Default Interview Location</label>
              <select
                id="defaultLocation"
                name="defaultLocation"
                value={interviewPrefs.defaultLocation || 'Virtual'}
                onChange={handleInterviewPrefsChange}
              >
                <option value="Virtual">Virtual</option>
                <option value="Office">Office</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading.interview}
            >
              {loading.interview ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
        
        {/* Notification Settings Tab */}
        {activeTab === 'notification' && (
          <form onSubmit={updateNotificationPreferences} className="settings-form">
            <h3>Email Notifications</h3>
            
            <div className="notification-option">
              <label>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email?.newApplicant || false}
                  onChange={() => handleNotificationToggle('newApplicant')}
                />
                New applicant notifications
              </label>
              <p className="notification-description">
                Receive email when a new candidate applies for a job
              </p>
            </div>
            
            <div className="notification-option">
              <label>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email?.interviewScheduled || false}
                  onChange={() => handleNotificationToggle('interviewScheduled')}
                />
                Interview scheduled notifications
              </label>
              <p className="notification-description">
                Receive email when an interview is scheduled
              </p>
            </div>
            
            <div className="notification-option">
              <label>
                <input
                  type="checkbox"
                  checked={notificationPrefs.email?.interviewCompleted || false}
                  onChange={() => handleNotificationToggle('interviewCompleted')}
                />
                Interview completed notifications
              </label>
              <p className="notification-description">
                Receive email when an interview is completed
              </p>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading.notification}
            >
              {loading.notification ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CompanySettings;
