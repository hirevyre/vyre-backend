# User Profile API Documentation

## Overview
This document provides detailed information about the user profile API endpoints, including request formats, response formats, and examples.

## Endpoints

### 1. GET /v1/users/me
Retrieves the current user's profile information.

#### Request
- Method: `GET`
- Headers: 
  - `Authorization: Bearer {access_token}`
- Body: None

#### Response
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "position": "Fullstack Developer",
      "department": "Engineering",
      "avatar": "https://example.com/avatar.jpg",
      "phoneNumber": "123-456-7890",
      "location": "New York, NY",
      "bio": "Software engineer with 5 years of experience...",
      "companyId": "company_id_here",
      "createdAt": "2023-01-15T00:00:00Z",
      "lastLogin": "2023-06-23T10:30:00Z"
    }
  }
}
```

### 2. PUT /v1/users/me
Updates the current user's profile information.

#### Request
- Method: `PUT`
- Headers: 
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
- Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "position": "Senior Fullstack Developer",
  "department": "Engineering",
  "avatar": "https://example.com/new-avatar.jpg",
  "phoneNumber": "123-456-7890",
  "location": "New York, NY",
  "bio": "Software engineer with 5 years of experience..."
}
```
Note: All fields are optional. Only include the fields you want to update.

#### Response
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "position": "Senior Fullstack Developer",
      "department": "Engineering",
      "avatar": "https://example.com/new-avatar.jpg",
      "phoneNumber": "123-456-7890",
      "location": "New York, NY",
      "bio": "Software engineer with 5 years of experience...",
      "companyId": "company_id_here"
    }
  }
}
```

### 3. PUT /v1/users/me/password
Changes the current user's password.

#### Request
- Method: `PUT`
- Headers: 
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
- Body:
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### 4. GET /v1/users/me/stats
Retrieves statistics related to the current user's activities.

#### Request
- Method: `GET`
- Headers: 
  - `Authorization: Bearer {access_token}`
- Body: None

#### Response
```json
{
  "status": "success",
  "message": "User statistics retrieved successfully",
  "data": {
    "jobsCreated": 8,
    "candidatesReviewed": 45,
    "interviewsScheduled": 32,
    "activitiesCount": 120,
    "recentActivities": [
      {
        "id": "activity_123",
        "action": "created",
        "entityType": "job",
        "description": "Created new job: Frontend Developer",
        "createdAt": "2023-06-22T14:30:00Z"
      },
      {
        "id": "activity_124",
        "action": "updated",
        "entityType": "candidate",
        "description": "Updated candidate status: Jane Smith",
        "createdAt": "2023-06-22T12:45:00Z"
      }
    ]
  }
}
```

## Common Errors

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Validation error",
  "errors": [
    {
      "field": "firstName",
      "message": "First name cannot be empty"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication failed. Token is invalid or expired.",
  "code": "UNAUTHORIZED"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "User not found",
  "code": "NOT_FOUND"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong!",
  "code": "SERVER_ERROR"
}
```

## Frontend Integration Tips

1. Always include the Authorization header with a valid JWT token
2. For PUT requests, only include fields that need to be updated
3. Handle error responses appropriately based on the error codes
4. Make sure all JSON is properly stringified when sending requests
5. Parse the response JSON to access the data

## Example Frontend Code (React/Axios)

```javascript
// Get user profile
const getUserProfile = async () => {
  try {
    const response = await axios.get('https://api.vyre.io/v1/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    setUserProfile(response.data.data.user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
};

// Update user profile
const updateUserProfile = async (profileData) => {
  try {
    const response = await axios.put('https://api.vyre.io/v1/users/me', profileData, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.data.user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
```
