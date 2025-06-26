# Company Settings API Integration Guide

Welcome to the Vyre API Company Settings integration guide. This README provides an overview of the available resources and tools to help you integrate with the company settings endpoints.

## Available Endpoints

The company settings API includes the following endpoints:

| Method | Endpoint                           | Description                        |
|--------|------------------------------------|----------------------------------- |
| GET    | /api/settings/company              | Get company information            |
| PUT    | /api/settings/company              | Update company information         |
| GET    | /api/settings/interview-preferences| Get interview preferences          |
| PUT    | /api/settings/interview-preferences| Update interview preferences       |
| GET    | /api/settings/notification-preferences| Get notification preferences    |
| PUT    | /api/settings/notification-preferences| Update notification preferences |

## Documentation Resources

We've provided several resources to help you with the integration:

1. **Company Settings API Integration Guide**
   - Detailed guide with examples of how to integrate with the company settings endpoints
   - Location: `/docs/company-settings-api-integration.md`

2. **Company Settings API Tutorial**
   - Step-by-step tutorial for implementing company settings features
   - Location: `/docs/company-settings-api-tutorial.md`

3. **Company Settings Troubleshooting Guide**
   - Solutions to common issues when integrating with the company settings API
   - Location: `/docs/company-settings-troubleshooting.md`

4. **Postman Collection**
   - Ready-to-use Postman collection for testing the company settings API
   - Location: `/postman/company-settings-collection.json`

## React Integration Example

We've included a working React component example that demonstrates how to integrate with the company settings API:

- Location: `/examples/company-settings-react.jsx`

This example includes:
- Authentication handling
- Form components for company settings
- API integration
- Error handling
- Loading states

## Getting Started

Follow these steps to get started with the company settings API:

1. **Read the API Documentation**
   ```bash
   # Serve the documentation locally
   npm run docs:serve
   ```
   Then open `http://localhost:8080/company-settings-api-integration.md` in your browser.

2. **Import the Postman Collection**
   ```bash
   # Run the import helper script
   npm run postman:import
   ```

3. **List All API Endpoints**
   ```bash
   # Show all available API endpoints
   npm run api:endpoints
   ```

4. **Examine the React Integration Example**
   Review `/examples/company-settings-react.jsx` to see a practical implementation.

## Authentication

All company settings endpoints require authentication. You must include the JWT access token in the Authorization header:

```javascript
axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
```

## Common Integration Tasks

### 1. Fetching Company Settings

```javascript
const getCompanySettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/company`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch company settings:', error);
    throw error;
  }
};
```

### 2. Updating Company Settings

```javascript
const updateCompanySettings = async (settings) => {
  try {
    const response = await axios.put(`${API_URL}/settings/company`, settings, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      return true;
    }
  } catch (error) {
    console.error('Failed to update company settings:', error);
    throw error;
  }
};
```

## Best Practices

1. **Error Handling**
   - Implement comprehensive error handling
   - Display user-friendly error messages
   - Log detailed errors for debugging

2. **Loading States**
   - Show loading indicators during API requests
   - Disable form controls during submissions
   - Handle timeouts gracefully

3. **Validation**
   - Validate form inputs before sending to the API
   - Format data according to API requirements
   - Handle validation errors properly

4. **Permissions**
   - Check user permissions before allowing edits
   - Hide edit controls for users without permission
   - Display appropriate permission messages

## Help and Support

If you encounter any issues with the company settings API, please:

1. Check the troubleshooting guide: `/docs/company-settings-troubleshooting.md`
2. Review the API documentation
3. Examine the React example for implementation references
4. Contact the API support team at api-support@vyre.io

---

Happy coding! We hope these resources help you successfully integrate with the Vyre Company Settings API.
