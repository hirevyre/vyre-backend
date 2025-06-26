# API Integration Tutorial - Company Settings

This tutorial provides detailed, step-by-step instructions for integrating with the Vyre API's company settings endpoints. It's designed to help frontend developers understand how to properly interact with these endpoints.

## Prerequisites

Before you begin, make sure you have:

1. A Vyre account with proper permissions
2. An authentication token (JWT)
3. Your frontend development environment set up

## Authentication Setup

All company settings endpoints require authentication. You'll need to include the JWT token in the Authorization header for all requests.

### Setting Up Axios with Authentication

```javascript
// Configure Axios with default headers
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://api.vyre.io/v1';

// Create an axios instance with auth headers
const createAuthenticatedClient = (token) => {
  return axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
};

// Example usage
const token = localStorage.getItem('accessToken');
const apiClient = createAuthenticatedClient(token);

// Now you can use apiClient for your authenticated requests
const fetchCompanySettings = async () => {
  try {
    const response = await apiClient.get('/settings/company');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
```

## 1. Company Information Management

### Fetching Company Information

To retrieve the company's basic information:

```javascript
const getCompanyInfo = async () => {
  try {
    const response = await apiClient.get('/settings/company');
    
    if (response.data.status === 'success') {
      // Success - handle the data
      const companyData = response.data.data;
      console.log('Company information:', companyData);
      
      // Update your UI state
      setCompanyInfo(companyData);
      return companyData;
    }
  } catch (error) {
    // Error handling
    console.error('Failed to fetch company information:', error);
    
    if (error.response?.status === 401) {
      // Handle authentication error - redirect to login
    } else if (error.response?.status === 403) {
      // Handle permission error
    } else {
      // Handle other errors
    }
  }
};
```

### Updating Company Information

To update the company information (requires admin privileges):

```javascript
const updateCompanyInfo = async (companyData) => {
  try {
    const response = await apiClient.put('/settings/company', companyData);
    
    if (response.data.status === 'success') {
      // Success - handle the response
      console.log('Company information updated successfully');
      
      // Show success notification to the user
      showNotification('success', 'Company information updated successfully');
      return true;
    }
  } catch (error) {
    // Error handling
    console.error('Failed to update company information:', error);
    
    if (error.response?.status === 401) {
      // Handle authentication error
      showNotification('error', 'Your session has expired. Please log in again.');
    } else if (error.response?.status === 403) {
      // Handle permission error
      showNotification('error', 'You do not have permission to update company settings.');
    } else {
      // Handle other errors
      showNotification('error', 'Failed to update company information. Please try again.');
    }
    
    return false;
  }
};
```

### Example Company Data Structure

```javascript
const companyData = {
  companyName: "Acme Inc",
  logoUrl: "/uploads/acme-logo.svg",
  website: "https://acme.com",
  industry: "Technology",
  companySize: "51-200",
  description: "We are a leading technology company focused on innovation and excellence."
};
```

## 2. Interview Preferences Management

### Fetching Interview Preferences

To retrieve the company's interview preferences:

```javascript
const getInterviewPreferences = async () => {
  try {
    const response = await apiClient.get('/settings/interview-preferences');
    
    if (response.data.status === 'success') {
      const preferences = response.data.data;
      console.log('Interview preferences:', preferences);
      
      // Update your UI state
      setInterviewPreferences(preferences);
      return preferences;
    }
  } catch (error) {
    console.error('Failed to fetch interview preferences:', error);
    handleApiError(error);
  }
};
```

### Updating Interview Preferences

To update the company's interview preferences:

```javascript
const updateInterviewPreferences = async (preferences) => {
  try {
    const response = await apiClient.put('/settings/interview-preferences', preferences);
    
    if (response.data.status === 'success') {
      console.log('Interview preferences updated successfully');
      
      // Show success notification
      showNotification('success', 'Interview preferences updated successfully');
      return true;
    }
  } catch (error) {
    console.error('Failed to update interview preferences:', error);
    handleApiError(error);
    return false;
  }
};
```

### Example Interview Preferences Structure

According to the API spec, this is what the interview preferences data structure looks like:

```javascript
const interviewPreferences = {
  emailNotifications: true,
  autoScheduleInterviews: false,
  sendReminderEmails: true,
  reminderTime: 24,
  defaultInterviewDuration: 45,
  defaultQuestionBank: [
    "Tell us about your experience with...",
    "How would you handle..."
  ]
};
```

## 3. Integration with UI Components

### Form for Company Settings

Here's a complete React component to manage company settings:

```jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed

const CompanySettingsForm = () => {
  const [companyInfo, setCompanyInfo] = useState({
    companyName: '',
    logoUrl: '',
    website: '',
    industry: '',
    companySize: '',
    description: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const { token, isAdmin } = useAuth(); // Get auth info from context
  
  // Create API client
  const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://api.vyre.io/v1',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Fetch company info on component mount
  useEffect(() => {
    fetchCompanyInfo();
  }, []);
  
  const fetchCompanyInfo = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings/company');
      
      if (response.data.status === 'success') {
        setCompanyInfo(response.data.data);
      }
    } catch (error) {
      setError('Failed to load company information. Please try again.');
      console.error('Error fetching company info:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAdmin) {
      setError('Only administrators can update company settings');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const response = await apiClient.put('/settings/company', companyInfo);
      
      if (response.data.status === 'success') {
        setSuccess('Company information updated successfully');
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      console.error('Error updating company info:', error);
      
      if (error.response?.status === 403) {
        setError('You do not have permission to update company settings');
      } else if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again');
        // Redirect to login
      } else {
        setError('Failed to update company information. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return <div className="loading-spinner">Loading company information...</div>;
  }
  
  return (
    <div className="company-settings-container">
      <h2>Company Settings</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="companyName">Company Name</label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={companyInfo.companyName || ''}
            onChange={handleChange}
            required
            disabled={!isAdmin}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="website">Website</label>
          <input
            type="url"
            id="website"
            name="website"
            value={companyInfo.website || ''}
            onChange={handleChange}
            placeholder="https://example.com"
            disabled={!isAdmin}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="industry">Industry</label>
          <input
            type="text"
            id="industry"
            name="industry"
            value={companyInfo.industry || ''}
            onChange={handleChange}
            disabled={!isAdmin}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="companySize">Company Size</label>
          <select
            id="companySize"
            name="companySize"
            value={companyInfo.companySize || ''}
            onChange={handleChange}
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
          <label htmlFor="description">Company Description</label>
          <textarea
            id="description"
            name="description"
            value={companyInfo.description || ''}
            onChange={handleChange}
            rows={5}
            disabled={!isAdmin}
          />
        </div>
        
        {isAdmin ? (
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        ) : (
          <p className="admin-notice">
            Only administrators can update company settings.
          </p>
        )}
      </form>
    </div>
  );
};

export default CompanySettingsForm;
```

## 4. Error Handling Utility

Create a reusable error handling utility to standardize error handling across API calls:

```javascript
const handleApiError = (error, defaultMessage = 'An error occurred') => {
  // Log the error for debugging
  console.error('API Error:', error);
  
  // Extract the error message
  const errorMessage = 
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    defaultMessage;
  
  // Get HTTP status code
  const statusCode = error.response?.status;
  
  // Check for specific error types
  const isAuthError = statusCode === 401;
  const isPermissionError = statusCode === 403;
  const isNotFoundError = statusCode === 404;
  const isValidationError = statusCode === 422;
  
  // Handle authentication errors
  if (isAuthError) {
    // Redirect to login or refresh token
    // E.g., redirectToLogin();
  }
  
  // Return structured error information
  return {
    message: errorMessage,
    statusCode,
    isAuthError,
    isPermissionError,
    isNotFoundError,
    isValidationError
  };
};

// Example usage
try {
  await apiClient.get('/settings/company');
} catch (error) {
  const errorInfo = handleApiError(error, 'Failed to load company settings');
  
  if (errorInfo.isPermissionError) {
    showNotification('error', 'You do not have permission to access these settings');
  } else {
    showNotification('error', errorInfo.message);
  }
}
```

## 5. Storing and Managing the Authentication Token

Here's how to manage authentication tokens securely:

```javascript
// Authentication service
const AuthService = {
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  
  getAccessToken: () => localStorage.getItem('accessToken'),
  
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  refreshAccessToken: async () => {
    try {
      const refreshToken = AuthService.getRefreshToken();
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await axios.post('https://api.vyre.io/v1/auth/refresh-token', {
        refreshToken
      });
      
      if (response.data.status === 'success') {
        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        return accessToken;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      AuthService.clearTokens();
      // Redirect to login
      window.location.href = '/login';
      throw error;
    }
  }
};

// Create an axios interceptor to handle token expiration
const setupAxiosInterceptors = (client) => {
  client.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to refresh the token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const newToken = await AuthService.refreshAccessToken();
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Usage
const apiClient = setupAxiosInterceptors(
  axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthService.getAccessToken()}`
    }
  })
);
```

## 6. Best Practices for API Integration

### Centralize API Logic

Create a dedicated service module for API calls:

```javascript
// services/settingsService.js
import apiClient from './apiClient';

export const SettingsService = {
  // Company settings
  getCompanySettings: async () => {
    const response = await apiClient.get('/settings/company');
    return response.data;
  },
  
  updateCompanySettings: async (data) => {
    const response = await apiClient.put('/settings/company', data);
    return response.data;
  },
  
  // Interview preferences
  getInterviewPreferences: async () => {
    const response = await apiClient.get('/settings/interview-preferences');
    return response.data;
  },
  
  updateInterviewPreferences: async (data) => {
    const response = await apiClient.put('/settings/interview-preferences', data);
    return response.data;
  },
  
  // Notification preferences
  getNotificationPreferences: async () => {
    const response = await apiClient.get('/settings/notification-preferences');
    return response.data;
  },
  
  updateNotificationPreferences: async (data) => {
    const response = await apiClient.put('/settings/notification-preferences', data);
    return response.data;
  }
};
```

### Implement Form Validation

Always validate form inputs before sending to the API:

```javascript
const validateCompanyData = (data) => {
  const errors = {};
  
  if (!data.companyName?.trim()) {
    errors.companyName = 'Company name is required';
  }
  
  if (data.website && !/^https?:\/\//.test(data.website)) {
    errors.website = 'Website must be a valid URL starting with http:// or https://';
  }
  
  // Return errors object (empty if no errors)
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Usage in form submission
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate form data
  const { isValid, errors } = validateCompanyData(companyInfo);
  
  if (!isValid) {
    setValidationErrors(errors);
    return;
  }
  
  // Proceed with API call
  try {
    await SettingsService.updateCompanySettings(companyInfo);
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

### Optimize Data Loading with Suspense and Error Boundaries (React 18+)

For modern React applications, use Suspense and Error Boundaries:

```jsx
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const CompanySettingsPage = () => {
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <h1>Company Settings</h1>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CompanySettingsForm />
      </Suspense>
    </ErrorBoundary>
  );
};

// Error fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
};
```

### Implement Optimistic UI Updates

For a better user experience, update the UI optimistically before receiving the API response:

```javascript
const updateCompanyInfo = async (updatedData) => {
  // Store original data for rollback if needed
  const originalData = { ...companyInfo };
  
  try {
    // Update UI immediately (optimistic update)
    setCompanyInfo(updatedData);
    
    // Make API call
    await SettingsService.updateCompanySettings(updatedData);
    
    // Show success message after confirmation from server
    setSuccess('Company information updated successfully');
  } catch (error) {
    // Rollback UI changes on error
    setCompanyInfo(originalData);
    
    // Show error message
    setError('Failed to update company information. Please try again.');
    console.error('Error updating company info:', error);
  }
};
```

## 7. Debugging and Troubleshooting

### Network Request Debugging

Use browser developer tools to debug API requests:

1. Open Chrome DevTools (F12)
2. Navigate to the Network tab
3. Filter by "Fetch/XHR"
4. Perform your action in the app
5. Inspect the request/response details

### Common Error Scenarios

1. **401 Unauthorized**: Token is invalid or expired
   - Solution: Refresh the token or redirect to login

2. **403 Forbidden**: User doesn't have permission
   - Solution: Check user roles and permissions

3. **404 Not Found**: Endpoint doesn't exist or resource not found
   - Solution: Check API URL and resource IDs

4. **422 Unprocessable Entity**: Validation errors
   - Solution: Check request payload against API schema

5. **Network Error**: API server unreachable
   - Solution: Check internet connection and API server status

### Logging and Monitoring

Implement proper logging for API interactions:

```javascript
const logApiActivity = (type, endpoint, data = null, error = null) => {
  // For development
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.error(`API ${type} ERROR - ${endpoint}:`, error);
      console.error('Request data:', data);
    } else {
      console.log(`API ${type} SUCCESS - ${endpoint}`);
      if (data) console.log('Data:', data);
    }
  }
  
  // For production - implement error tracking service
  if (process.env.NODE_ENV === 'production' && error) {
    // Example with error tracking service like Sentry
    // Sentry.captureException(error, {
    //   extra: {
    //     type,
    //     endpoint,
    //     requestData: data
    //   }
    // });
  }
};

// Usage
try {
  const data = { companyName: 'New Name' };
  logApiActivity('PUT', '/settings/company', data);
  const response = await apiClient.put('/settings/company', data);
  return response.data;
} catch (error) {
  logApiActivity('PUT', '/settings/company', data, error);
  throw error;
}
```

## Conclusion

This tutorial covered the essential aspects of integrating with Vyre's company settings API endpoints. By following these guidelines, you'll be able to create robust, user-friendly interfaces for managing company settings in your application.

Remember these key points:

1. Always handle authentication properly
2. Validate form inputs before sending to the API
3. Implement comprehensive error handling
4. Create a good user experience with loading states and error messages
5. Centralize API logic in service modules
6. Use proper debugging techniques when issues arise

For more information, refer to the complete API documentation or contact the Vyre API support team.
