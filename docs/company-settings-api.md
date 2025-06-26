# Company Settings API Integration Guide

## Overview
This document provides detailed information about the company settings API endpoints, including request formats, response formats, and examples.

## Base URL
All endpoints are relative to the base URL: `https://api.vyre.io/v1`

## Authentication
All company settings endpoints require authentication using JWT tokens:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Endpoints

### 1. Get Company Settings

Retrieves the company settings for the authenticated user's company.

#### Request
- **Method**: `GET`
- **Endpoint**: `/settings/company`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body**: None

#### Response
```json
{
  "status": "success",
  "data": {
    "companyName": "Acme Inc",
    "description": "Leading tech company focused on innovation",
    "logo": "https://example.com/logos/acme.png",
    "website": "https://acme.example.com",
    "industry": "Technology",
    "size": "51-200",
    "location": "New York, NY"
  }
}
```

### 2. Update Company Settings

Updates the company settings. Requires admin privileges.

#### Request
- **Method**: `PUT`
- **Endpoint**: `/settings/company`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "companyName": "Acme Technologies Inc",
  "description": "Leading tech company focused on innovation and excellence",
  "website": "https://acmetech.example.com",
  "industry": "Information Technology",
  "size": "201-500",
  "location": "San Francisco, CA"
}
```
Note: All fields are optional. Only include the fields you want to update.

#### Response
```json
{
  "status": "success",
  "message": "Company settings updated successfully"
}
```

### 3. Get Interview Preferences

Retrieves the interview preferences for the company.

#### Request
- **Method**: `GET`
- **Endpoint**: `/settings/interview-preferences`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body**: None

#### Response
```json
{
  "status": "success",
  "data": {
    "defaultDuration": 60,
    "defaultLocation": "Virtual"
  }
}
```

### 4. Update Interview Preferences

Updates the interview preferences for the company.

#### Request
- **Method**: `PUT`
- **Endpoint**: `/settings/interview-preferences`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "defaultDuration": 45,
  "defaultLocation": "Office"
}
```
Note: All fields are optional. Only include the fields you want to update.

#### Response
```json
{
  "status": "success",
  "message": "Interview preferences updated successfully"
}
```

### 5. Get Notification Preferences

Retrieves the notification preferences for the company.

#### Request
- **Method**: `GET`
- **Endpoint**: `/settings/notification-preferences`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
- **Body**: None

#### Response
```json
{
  "status": "success",
  "data": {
    "email": {
      "newApplicant": true,
      "interviewScheduled": true,
      "interviewCompleted": true
    }
  }
}
```

### 6. Update Notification Preferences

Updates the notification preferences for the company.

#### Request
- **Method**: `PUT`
- **Endpoint**: `/settings/notification-preferences`
- **Headers**: 
  - `Authorization: Bearer YOUR_ACCESS_TOKEN`
  - `Content-Type: application/json`
- **Body**:
```json
{
  "email": {
    "newApplicant": true,
    "interviewScheduled": false,
    "interviewCompleted": true
  }
}
```
Note: You only need to include the specific preferences you want to update.

#### Response
```json
{
  "status": "success",
  "message": "Notification preferences updated successfully"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication failed. Token is invalid or expired.",
  "code": "UNAUTHORIZED"
}
```

### 403 Forbidden
```json
{
  "status": "error",
  "message": "Only admins can update company settings",
  "code": "FORBIDDEN"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Company not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Failed to update company settings",
  "code": "SERVER_ERROR"
}
```

## Frontend Integration Examples

### React/Axios Example

```javascript
import axios from 'axios';

const API_URL = 'https://api.vyre.io/v1';
const accessToken = localStorage.getItem('accessToken');

// 1. Get Company Settings
const getCompanySettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/company`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching company settings:', error.response?.data || error.message);
    throw error;
  }
};

// 2. Update Company Settings (admin only)
const updateCompanySettings = async (settingsData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/company`, settingsData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating company settings:', error.response?.data || error.message);
    throw error;
  }
};

// 3. Get Interview Preferences
const getInterviewPreferences = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/interview-preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching interview preferences:', error.response?.data || error.message);
    throw error;
  }
};

// 4. Update Interview Preferences
const updateInterviewPreferences = async (preferencesData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/interview-preferences`, preferencesData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating interview preferences:', error.response?.data || error.message);
    throw error;
  }
};

// 5. Get Notification Preferences
const getNotificationPreferences = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/notification-preferences`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching notification preferences:', error.response?.data || error.message);
    throw error;
  }
};

// 6. Update Notification Preferences
const updateNotificationPreferences = async (preferencesData) => {
  try {
    const response = await axios.put(`${API_URL}/settings/notification-preferences`, preferencesData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error.response?.data || error.message);
    throw error;
  }
};
```

### React Component Example: Company Settings Form

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'https://api.vyre.io/v1';

const CompanySettingsForm = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const accessToken = localStorage.getItem('accessToken'); // Or from your auth context

  // Fetch company settings
  useEffect(() => {
    const fetchCompanySettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/settings/company`, {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });
        
        setSettings(response.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load company settings');
        console.error('Error fetching company settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanySettings();
  }, [accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);
    
    try {
      setLoading(true);
      await axios.put(`${API_URL}/settings/company`, settings, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess('Company settings updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update company settings');
      console.error('Error updating company settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !settings.companyName) {
    return <div>Loading company settings...</div>;
  }

  return (
    <div className="company-settings">
      <h2>Company Settings</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={settings.companyName || ''}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={settings.description || ''}
            onChange={handleInputChange}
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={settings.website || ''}
            onChange={handleInputChange}
            placeholder="https://example.com"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={settings.industry || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="size">Company Size</label>
          <select
            id="size"
            name="size"
            value={settings.size || ''}
            onChange={handleInputChange}
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
            value={settings.location || ''}
            onChange={handleInputChange}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default CompanySettingsForm;
```

## Best Practices

1. **Error Handling**: Always implement proper error handling to provide feedback to users when API calls fail.
2. **Loading States**: Show loading indicators while waiting for API responses.
3. **Form Validation**: Validate form inputs on the frontend before submitting to the API.
4. **Authorization Check**: Check if the user has admin privileges before showing company settings edit options.
5. **Optimistic Updates**: For a better user experience, update the UI optimistically before the API call completes, then revert if there's an error.
6. **Debouncing**: Consider debouncing or throttling for inputs that might trigger frequent updates.

## Troubleshooting

1. **401 Unauthorized**: Check if your access token is valid and not expired.
2. **403 Forbidden**: Verify the user has admin privileges to update company settings.
3. **404 Not Found**: Ensure the company ID associated with the user is valid.
4. **Content-Type Header**: Make sure the `Content-Type: application/json` header is set for all PUT requests.
5. **Invalid JSON**: Ensure all request bodies are properly formatted JSON objects.
