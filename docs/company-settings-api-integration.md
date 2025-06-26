# Vyre API - Company Settings Integration Guidelines

This document provides detailed guidelines for frontend developers to integrate with the Vyre API's company settings endpoints.

## Authentication

All company settings endpoints require authentication. Make sure to include the JWT token in the Authorization header.

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

## API Base URL

Replace `BASE_URL` with your actual API base URL (e.g., https://api.vyre.com/v1 or http://localhost:5000/api).

## Available Endpoints

### 1. Company Settings

#### Get Company Settings
```
GET /settings/company
```

**Request:**
- No body required
- Authentication header required

**Response:**
```json
{
  "success": true,
  "data": {
    "companyName": "Vyre Inc.",
    "description": "Recruitment platform",
    "logo": "https://example.com/logo.png",
    "website": "https://example.com",
    "industry": "Technology",
    "size": "11-50",
    "location": "San Francisco, CA"
  }
}
```

**Example Integration (React with Axios):**
```javascript
import axios from 'axios';

const fetchCompanySettings = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/settings/company`);
    
    if (response.data.success) {
      // Handle successful response
      const companyData = response.data.data;
      console.log('Company settings:', companyData);
      // Update your state/UI with the data
      return companyData;
    }
  } catch (error) {
    console.error('Error fetching company settings:', error.response?.data || error.message);
    // Handle error (display notification, etc.)
  }
};
```

#### Update Company Settings
```
PUT /settings/company
```

**Request:**
- Authentication header required
- Admin role required
- Request body:

```json
{
  "companyName": "Updated Company Name",
  "description": "Updated company description",
  "website": "https://updatedwebsite.com",
  "industry": "Software",
  "size": "51-200",
  "location": "New York, NY"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Company settings updated successfully"
}
```

**Example Integration (React with Axios):**
```javascript
import axios from 'axios';

const updateCompanySettings = async (updatedSettings) => {
  try {
    const response = await axios.put(`${BASE_URL}/settings/company`, updatedSettings);
    
    if (response.data.success) {
      // Handle successful update
      console.log(response.data.message);
      // Display success notification, update UI, etc.
      return true;
    }
  } catch (error) {
    console.error('Error updating company settings:', error.response?.data || error.message);
    
    // Check for specific error types
    if (error.response?.status === 403) {
      // Handle unauthorized (not an admin)
      console.error('Only admins can update company settings');
    } else if (error.response?.status === 404) {
      // Company not found
      console.error('Company not found');
    }
    
    // Display error notification
    return false;
  }
};
```

### 2. Interview Preferences

#### Get Interview Preferences
```
GET /settings/interview-preferences
```

**Request:**
- No body required
- Authentication header required

**Response:**
```json
{
  "success": true,
  "data": {
    "defaultDuration": 60,
    "defaultLocation": "Virtual"
  }
}
```

**Example Integration:**
```javascript
import axios from 'axios';

const fetchInterviewPreferences = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/settings/interview-preferences`);
    
    if (response.data.success) {
      const preferences = response.data.data;
      console.log('Interview preferences:', preferences);
      // Update your state/UI with the data
      return preferences;
    }
  } catch (error) {
    console.error('Error fetching interview preferences:', error.response?.data || error.message);
    // Handle error
  }
};
```

#### Update Interview Preferences
```
PUT /settings/interview-preferences
```

**Request:**
- Authentication header required
- Request body:

```json
{
  "defaultDuration": 45,
  "defaultLocation": "Office"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview preferences updated successfully"
}
```

**Example Integration:**
```javascript
import axios from 'axios';

const updateInterviewPreferences = async (preferences) => {
  try {
    const response = await axios.put(`${BASE_URL}/settings/interview-preferences`, preferences);
    
    if (response.data.success) {
      console.log(response.data.message);
      // Display success notification, update UI, etc.
      return true;
    }
  } catch (error) {
    console.error('Error updating interview preferences:', error.response?.data || error.message);
    // Handle error
    return false;
  }
};
```

### 3. Notification Preferences

#### Get Notification Preferences
```
GET /settings/notification-preferences
```

**Request:**
- No body required
- Authentication header required

**Response:**
```json
{
  "success": true,
  "data": {
    "email": {
      "newApplicant": true,
      "interviewScheduled": true,
      "interviewCompleted": true
    }
  }
}
```

**Example Integration:**
```javascript
import axios from 'axios';

const fetchNotificationPreferences = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/settings/notification-preferences`);
    
    if (response.data.success) {
      const preferences = response.data.data;
      console.log('Notification preferences:', preferences);
      // Update your state/UI with the data
      return preferences;
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error.response?.data || error.message);
    // Handle error
  }
};
```

#### Update Notification Preferences
```
PUT /settings/notification-preferences
```

**Request:**
- Authentication header required
- Request body:

```json
{
  "email": {
    "newApplicant": true,
    "interviewScheduled": false,
    "interviewCompleted": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notification preferences updated successfully"
}
```

**Example Integration:**
```javascript
import axios from 'axios';

const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await axios.put(`${BASE_URL}/settings/notification-preferences`, preferences);
    
    if (response.data.success) {
      console.log(response.data.message);
      // Display success notification, update UI, etc.
      return true;
    }
  } catch (error) {
    console.error('Error updating notification preferences:', error.response?.data || error.message);
    // Handle error
    return false;
  }
};
```

## Common Error Handling

Here's a reusable error handling function for your API requests:

```javascript
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  const errorMessage = 
    error.response?.data?.message || 
    error.response?.data?.error || 
    error.message || 
    defaultMessage;
    
  // Log the error for debugging
  console.error('API Error:', errorMessage, error);
  
  // Return structured error information
  return {
    message: errorMessage,
    status: error.response?.status,
    isAuthError: error.response?.status === 401,
    isPermissionError: error.response?.status === 403,
    isNotFoundError: error.response?.status === 404
  };
};
```

## Complete React Component Example

Here's a complete example of a React component that interacts with the company settings API:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Or your preferred notification library

const CompanySettingsForm = () => {
  const [settings, setSettings] = useState({
    companyName: '',
    description: '',
    website: '',
    industry: '',
    size: '',
    location: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/settings/company`);
      
      if (response.data.success) {
        setSettings(response.data.data);
      }
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to load company settings');
      toast.error(errorInfo.message);
      
      if (errorInfo.isAuthError) {
        // Redirect to login
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/settings/company`, 
        settings
      );
      
      if (response.data.success) {
        toast.success('Company settings updated successfully');
      }
    } catch (error) {
      const errorInfo = handleApiError(error, 'Failed to update company settings');
      toast.error(errorInfo.message);
      
      if (errorInfo.isPermissionError) {
        toast.error('You do not have permission to update company settings');
      }
    } finally {
      setSaving(false);
    }
  };
  
  const handleApiError = (error, defaultMessage = 'An error occurred') => {
    const errorMessage = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.message || 
      defaultMessage;
      
    return {
      message: errorMessage,
      status: error.response?.status,
      isAuthError: error.response?.status === 401,
      isPermissionError: error.response?.status === 403
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="company-settings">
      <h2>Company Settings</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={settings.companyName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={settings.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={settings.website}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={settings.industry}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="size">Company Size</label>
          <select
            id="size"
            name="size"
            value={settings.size}
            onChange={handleChange}
          >
            <option value="">Select size</option>
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
            value={settings.location}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default CompanySettingsForm;
```

## Troubleshooting

### Common Issues

1. **Authentication Errors (401)**
   - Check if the token is expired
   - Ensure the token is correctly included in the authorization header
   - Try refreshing the token or logging in again

2. **Permission Errors (403)**
   - Verify the user has the right role (admin) for restricted actions
   - Check with your backend team if your user account has the correct permissions

3. **Not Found Errors (404)**
   - Ensure the company ID exists in the database
   - Verify the API endpoint URL is correct

4. **Server Errors (500)**
   - Check server logs for detailed error information
   - Contact the backend team with the timestamp and error details

5. **CORS Issues**
   - Ensure your frontend domain is allowed in the CORS configuration
   - Check for CORS headers in preflight OPTIONS requests

## Best Practices

1. **Use centralized API services**
   Create a dedicated API service module for your settings-related API calls to maintain consistency and reusability.

2. **Implement proper loading states**
   Always handle loading states to provide feedback to users during API operations.

3. **Add validation**
   Validate form inputs before sending requests to reduce server errors.

4. **Implement caching**
   Consider caching settings that don't change frequently to improve performance.

5. **Use appropriate error handling**
   Implement comprehensive error handling with user-friendly error messages.
