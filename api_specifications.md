# Vyre API Specifications

## Overview

This document outlines the specifications for the Vyre API, a RESTful API designed to support the Vyre recruitment platform. The API will handle all backend functionality including authentication, job management, candidate management, interview processes, reports, analytics, team management, and notifications.

## Base URL

```
https://api.vyre.io/v1
localhost: https://localhost:5000
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. The authentication system implements a two-token approach:
- **Access Token**: Short-lived token (24-hour expiry) used for API authorization
- **Refresh Token**: Long-lived token (30-day expiry) used to obtain new access tokens without requiring the user to log in again

### Authentication Endpoints

#### Register

```
POST /auth/register
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "Acme Inc"
}
```

Response:
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "companyId": "company_123"
  }
}
```

#### Login

```
POST /auth/login
```

Request Body:
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

Response:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_access_token_here",
    "refreshToken": "jwt_refresh_token_here",
    "accessTokenExpiresAt": "2023-06-24T14:00:00Z",
    "userId": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

#### Forgot Password

```
POST /auth/forgot-password
```

Request Body:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "status": "success",
  "message": "Password reset link sent to your email"
}
```

#### Reset Password

```
POST /auth/reset-password
```

Request Body:
```json
{
  "token": "reset_token_here",
  "newPassword": "newSecurePassword"
}
```

Response:
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

#### Refresh Token

```
POST /auth/refresh-token
```

Request Body:
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

Response:
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new_jwt_access_token_here",
    "accessTokenExpiresAt": "2023-06-24T14:00:00Z"
  }
}
```

#### Revoke Token

```
POST /auth/revoke-token
```

Request Body:
```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

Response:
```json
{
  "status": "success",
  "message": "Token revoked successfully"
}
```

## Jobs

### Job Endpoints

#### Create Job

```
POST /jobs
```

Request Body:
```json
{
  "jobTitle": "Frontend Developer",
  "department": "engineering",
  "experienceLevel": "mid",
  "employmentType": "full-time",
  "location": "remote",
  "salaryRange": "$80,000 - $120,000",
  "startDate": "2023-08-01",
  "skills": ["React", "TypeScript", "Node.js"],
  "jobDescription": "We are looking for a talented frontend developer...",
  "screeningQuestions": ["Describe your experience with React...", "..."],
  "internalNotes": "Internal notes for the team",
  "customInterview": false,
  "publishOptions": {
    "shareableLink": true,
    "jobBoards": true,
    "emailInvites": false
  }
}
```

Response:
```json
{
  "status": "success",
  "message": "Job created successfully",
  "data": {
    "jobId": "job_123",
    "jobTitle": "Frontend Developer",
    "status": "Active",
    "createdDate": "2023-06-23T12:00:00Z"
  }
}
```

#### List Jobs

```
GET /jobs
```

Query Parameters:
- `status`: Filter by status (active, draft, closed)
- `page`: Page number for pagination
- `limit`: Number of items per page
- `q`: Search query
- `sort`: Sort field (e.g., createdDate)
- `order`: Sort order (asc, desc)

Response:
```json
{
  "status": "success",
  "data": {
    "total": 12,
    "pages": 2,
    "currentPage": 1,
    "jobs": [
      {
        "id": "job_123",
        "title": "Frontend Developer",
        "department": "Engineering",
        "status": "Active",
        "createdDate": "2023-05-15T08:00:00Z",
        "applicants": 24,
        "interviewsDone": 12
      },
      // more jobs...
    ]
  }
}
```

#### Get Job Details

```
GET /jobs/:jobId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "job_123",
    "title": "Frontend Developer",
    "department": "Engineering",
    "experienceLevel": "mid",
    "employmentType": "full-time",
    "location": "remote",
    "salaryRange": "$80,000 - $120,000",
    "startDate": "2023-08-01",
    "skills": ["React", "TypeScript", "Node.js"],
    "jobDescription": "We are looking for a talented frontend developer...",
    "screeningQuestions": ["Describe your experience with React...", "..."],
    "status": "Active",
    "createdDate": "2023-05-15T08:00:00Z",
    "applicants": 24,
    "interviewsDone": 12,
    "internalNotes": "Internal notes for the team",
    "publishOptions": {
      "shareableLink": true,
      "jobBoards": true,
      "emailInvites": false
    }
  }
}
```

#### Update Job

```
PUT /jobs/:jobId
```

Request Body: Same as Create Job

Response:
```json
{
  "status": "success",
  "message": "Job updated successfully",
  "data": {
    "jobId": "job_123",
    "jobTitle": "Senior Frontend Developer",
    "status": "Active"
  }
}
```

#### Change Job Status

```
PATCH /jobs/:jobId/status
```

Request Body:
```json
{
  "status": "Closed"
}
```

Response:
```json
{
  "status": "success",
  "message": "Job status updated successfully",
  "data": {
    "jobId": "job_123",
    "status": "Closed"
  }
}
```

#### Delete Job

```
DELETE /jobs/:jobId
```

Response:
```json
{
  "status": "success",
  "message": "Job deleted successfully"
}
```

#### Get Job Applicants

```
GET /jobs/:jobId/applicants
```

Query Parameters:
- `status`: Filter by status (all, shortlisted, rejected, etc.)
- `page`: Page number for pagination
- `limit`: Number of items per page

Response:
```json
{
  "status": "success",
  "data": {
    "total": 24,
    "pages": 3,
    "currentPage": 1,
    "applicants": [
      {
        "id": "candidate_123",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "applyDate": "2023-06-01T10:00:00Z",
        "status": "Shortlisted",
        "score": 85
      },
      // more applicants...
    ]
  }
}
```

## Candidates

### Candidate Endpoints

#### Create Candidate

```
POST /candidates
```

Request Body:
```json
{
  "firstName": "Sarah",
  "lastName": "Johnson",
  "email": "sarah.johnson@example.com",
  "phone": "+1234567890",
  "resumeUrl": "https://storage.vyre.io/resumes/sarah-johnson.pdf",
  "linkedIn": "https://linkedin.com/in/sarah-johnson",
  "jobId": "job_123",
  "coverLetter": "I am writing to apply for..."
}
```

Response:
```json
{
  "status": "success",
  "message": "Candidate created successfully",
  "data": {
    "candidateId": "candidate_123",
    "name": "Sarah Johnson",
    "email": "sarah.johnson@example.com"
  }
}
```

#### List Candidates

```
GET /candidates
```

Query Parameters:
- `jobId`: Filter by job ID
- `status`: Filter by status (shortlisted, rejected, etc.)
- `page`: Page number for pagination
- `limit`: Number of items per page
- `q`: Search query

Response:
```json
{
  "status": "success",
  "data": {
    "total": 132,
    "pages": 7,
    "currentPage": 1,
    "candidates": [
      {
        "id": "candidate_123",
        "name": "Sarah Johnson",
        "email": "sarah.johnson@example.com",
        "jobTitle": "Frontend Developer",
        "status": "Shortlisted",
        "applyDate": "2023-06-01T10:00:00Z"
      },
      // more candidates...
    ]
  }
}
```

#### Get Candidate Details

```
GET /candidates/:candidateId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "candidate_123",
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@example.com",
    "phone": "+1234567890",
    "resumeUrl": "https://storage.vyre.io/resumes/sarah-johnson.pdf",
    "linkedIn": "https://linkedin.com/in/sarah-johnson",
    "jobId": "job_123",
    "jobTitle": "Frontend Developer",
    "coverLetter": "I am writing to apply for...",
    "status": "Shortlisted",
    "applyDate": "2023-06-01T10:00:00Z",
    "lastUpdated": "2023-06-15T14:30:00Z"
  }
}
```

#### Update Candidate

```
PUT /candidates/:candidateId
```

Request Body: Same as Create Candidate with additional fields

Response:
```json
{
  "status": "success",
  "message": "Candidate updated successfully",
  "data": {
    "candidateId": "candidate_123",
    "name": "Sarah Johnson"
  }
}
```

#### Update Candidate Status

```
PATCH /candidates/:candidateId/status
```

Request Body:
```json
{
  "status": "Shortlisted",
  "notes": "Great technical skills, proceed to next round"
}
```

Response:
```json
{
  "status": "success",
  "message": "Candidate status updated successfully",
  "data": {
    "candidateId": "candidate_123",
    "status": "Shortlisted"
  }
}
```

#### Delete Candidate

```
DELETE /candidates/:candidateId
```

Response:
```json
{
  "status": "success",
  "message": "Candidate deleted successfully"
}
```

#### Add Notes to Candidate

```
POST /candidates/:candidateId/notes
```

Request Body:
```json
{
  "notes": "Candidate showed excellent problem-solving skills during the interview"
}
```

Response:
```json
{
  "status": "success",
  "message": "Notes added successfully",
  "data": {
    "noteId": "note_123",
    "candidateId": "candidate_123",
    "createdAt": "2023-06-23T14:00:00Z"
  }
}
```

#### Get Candidate Notes

```
GET /candidates/:candidateId/notes
```

Response:
```json
{
  "status": "success",
  "data": {
    "notes": [
      {
        "id": "note_123",
        "content": "Candidate showed excellent problem-solving skills during the interview",
        "createdBy": "user_123",
        "createdByName": "John Doe",
        "createdAt": "2023-06-23T14:00:00Z"
      },
      // more notes...
    ]
  }
}
```

## Interviews

### Interview Endpoints

#### Schedule Interview

```
POST /interviews
```

Request Body:
```json
{
  "candidateId": "candidate_123",
  "jobId": "job_123",
  "interviewers": ["user_123", "user_124"],
  "date": "2023-07-01",
  "time": "10:00",
  "duration": 45,
  "location": "Virtual",
  "linkOrAddress": "https://meet.vyre.io/interview/123",
  "type": "Technical"
}
```

Response:
```json
{
  "status": "success",
  "message": "Interview scheduled successfully",
  "data": {
    "interviewId": "interview_123",
    "candidateName": "Sarah Johnson",
    "jobTitle": "Frontend Developer",
    "date": "2023-07-01",
    "time": "10:00"
  }
}
```

#### List Interviews

```
GET /interviews
```

Query Parameters:
- `status`: Filter by status (all, completed, pending, shortlisted, rejected)
- `page`: Page number for pagination
- `limit`: Number of items per page
- `dateFrom`: Filter interviews from date
- `dateTo`: Filter interviews to date

Response:
```json
{
  "status": "success",
  "data": {
    "total": 89,
    "pages": 5,
    "currentPage": 1,
    "interviews": [
      {
        "id": "interview_123",
        "candidate": {
          "id": "candidate_123",
          "name": "Sarah Johnson",
          "image": "/placeholder.svg",
          "initials": "SJ"
        },
        "role": "Frontend Developer",
        "date": "2023-06-15",
        "time": "10:00 AM",
        "status": "completed"
      },
      // more interviews...
    ]
  }
}
```

#### Get Interview Details

```
GET /interviews/:interviewId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "interview_123",
    "candidate": {
      "id": "candidate_123",
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "image": "/placeholder.svg",
      "initials": "SJ"
    },
    "role": "Frontend Developer",
    "jobId": "job_123",
    "date": "2023-06-15",
    "time": "10:00 AM",
    "duration": "45 minutes",
    "status": "completed",
    "interviewer": "John Doe",
    "overallScore": 85,
    "recommendation": "Shortlist",
    "skills": {
      "technical": 88,
      "communication": 82,
      "problemSolving": 90,
      "teamwork": 80
    },
    "transcript": "Interviewer: Good morning Sarah, thank you for joining us today...",
    "feedback": "Sarah demonstrated strong technical skills and excellent communication...",
    "notes": "Great candidate with solid React experience"
  }
}
```

#### Update Interview

```
PUT /interviews/:interviewId
```

Request Body: Similar to Schedule Interview

Response:
```json
{
  "status": "success",
  "message": "Interview updated successfully",
  "data": {
    "interviewId": "interview_123"
  }
}
```

#### Update Interview Status

```
PATCH /interviews/:interviewId/status
```

Request Body:
```json
{
  "status": "completed"
}
```

Response:
```json
{
  "status": "success",
  "message": "Interview status updated successfully",
  "data": {
    "interviewId": "interview_123",
    "status": "completed"
  }
}
```

#### Delete Interview

```
DELETE /interviews/:interviewId
```

Response:
```json
{
  "status": "success",
  "message": "Interview deleted successfully"
}
```

#### Submit Interview Feedback

```
POST /interviews/:interviewId/feedback
```

Request Body:
```json
{
  "overallScore": 85,
  "recommendation": "Shortlist",
  "skills": {
    "technical": 88,
    "communication": 82,
    "problemSolving": 90,
    "teamwork": 80
  },
  "feedback": "Sarah demonstrated strong technical skills and excellent communication...",
  "transcript": "Interviewer: Good morning Sarah, thank you for joining us today..."
}
```

Response:
```json
{
  "status": "success",
  "message": "Interview feedback submitted successfully",
  "data": {
    "interviewId": "interview_123"
  }
}
```

#### Add Notes to Interview

```
POST /interviews/:interviewId/notes
```

Request Body:
```json
{
  "notes": "Candidate showed excellent communication skills"
}
```

Response:
```json
{
  "status": "success",
  "message": "Notes added successfully",
  "data": {
    "noteId": "note_123",
    "interviewId": "interview_123",
    "createdAt": "2023-06-23T14:00:00Z"
  }
}
```

## Reports

### Report Endpoints

#### List Reports

```
GET /reports
```

Query Parameters:
- `page`: Page number for pagination
- `limit`: Number of items per page
- `q`: Search query

Response:
```json
{
  "status": "success",
  "data": {
    "total": 87,
    "pages": 5,
    "currentPage": 1,
    "reports": [
      {
        "id": "1",
        "candidate": {
          "name": "Sarah Johnson",
          "email": "sarah.johnson@example.com"
        },
        "role": "Frontend Developer",
        "interviewDate": "2023-06-15",
        "result": "Shortlist",
        "score": 85
      },
      // more reports...
    ]
  }
}
```

#### Get Report Details

```
GET /reports/:reportId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "candidate": {
      "name": "Sarah Johnson",
      "email": "sarah.johnson@example.com",
      "image": "/placeholder.svg",
      "initials": "SJ"
    },
    "role": "Frontend Developer",
    "interviewDate": "2023-06-15",
    "result": "Shortlist",
    "overallScore": 85,
    "jdFitScore": 92,
    "skills": {
      "softSkills": {
        "communication": 88,
        "teamwork": 82,
        "leadership": 75,
        "adaptability": 90,
        "problemSolving": 85
      },
      "hardSkills": {
        "react": 95,
        "typescript": 88,
        "nodejs": 80,
        "testing": 85,
        "designSystems": 90
      }
    },
    "summary": "Sarah is an excellent candidate with strong technical skills...",
    "feedback": "Highly recommended for the Frontend Developer position...",
    "strengths": [
      "Strong technical expertise in React and TypeScript",
      "Excellent communication and presentation skills",
      "Proven experience with performance optimization",
      "Good understanding of design systems and component libraries"
    ],
    "areasForImprovement": [
      "Could benefit from more backend development experience",
      "Limited experience with mobile development"
    ]
  }
}
```

#### Generate Report

```
POST /reports
```

Request Body:
```json
{
  "interviewId": "interview_123",
  "includeTranscript": true
}
```

Response:
```json
{
  "status": "success",
  "message": "Report generated successfully",
  "data": {
    "reportId": "report_123"
  }
}
```

#### Add Notes to Report

```
POST /reports/:reportId/notes
```

Request Body:
```json
{
  "notes": "This candidate would be a great fit for the team"
}
```

Response:
```json
{
  "status": "success",
  "message": "Notes added successfully",
  "data": {
    "noteId": "note_123",
    "reportId": "report_123",
    "createdAt": "2023-06-23T14:00:00Z"
  }
}
```

## Analytics

### Analytics Endpoints

#### Get Dashboard Analytics

```
GET /analytics/dashboard
```

Response:
```json
{
  "status": "success",
  "data": {
    "totalJobs": 12,
    "totalCandidates": 132,
    "interviewsCompleted": 89,
    "candidatesShortlisted": 24
  }
}
```

#### Get Recruitment Analytics

```
GET /analytics/recruitment
```

Query Parameters:
- `period`: Time period (week, month, quarter)

Response:
```json
{
  "status": "success",
  "data": {
    "timeToHire": {
      "average": 18,
      "trend": -12
    },
    "candidateScore": {
      "average": 78,
      "trend": 4
    },
    "interviewToHireRatio": "1:6",
    "trendImprovement": -8,
    "mostSourcedRole": {
      "title": "Frontend Dev",
      "count": 32
    },
    "activityData": [
      {
        "month": "Jan",
        "applications": 45,
        "interviews": 23,
        "hires": 5
      },
      // more activity data...
    ],
    "roleData": [
      {
        "name": "Frontend Dev",
        "value": 32
      },
      // more role data...
    ]
  }
}
```

#### Get Job Analytics

```
GET /analytics/jobs/:jobId
```

Response:
```json
{
  "status": "success",
  "data": {
    "applications": 24,
    "interviewsScheduled": 15,
    "interviewsCompleted": 12,
    "shortlisted": 5,
    "rejected": 7,
    "timeToFill": 21,
    "candidateSourceBreakdown": [
      {
        "source": "LinkedIn",
        "count": 12
      },
      {
        "source": "Company Website",
        "count": 8
      },
      {
        "source": "Indeed",
        "count": 4
      }
    ],
    "skillsMatch": [
      {
        "skill": "React",
        "matchPercentage": 85
      },
      {
        "skill": "TypeScript",
        "matchPercentage": 70
      },
      {
        "skill": "Node.js",
        "matchPercentage": 50
      }
    ]
  }
}
```

## Users

### User Profile Endpoints

#### Get Current User Profile

```
GET /users/me
```

Response:
```json
{
  "status": "success",
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "position": "CTO",
      "department": "Engineering",
      "avatar": "/placeholder.svg",
      "companyId": "company_123",
      "createdAt": "2023-01-15T00:00:00Z",
      "lastLogin": "2023-06-23T10:30:00Z"
    }
  }
}
```

#### Update Current User Profile

```
PUT /users/me
```

Request Body:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "position": "CTO",
  "department": "Engineering",
  "avatar": "https://storage.vyre.io/avatars/john-doe.jpg"
}
```

Response:
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "position": "CTO",
      "department": "Engineering",
      "avatar": "https://storage.vyre.io/avatars/john-doe.jpg"
    }
  }
}
```

#### Change User Password

```
PUT /users/me/password
```

Request Body:
```json
{
  "currentPassword": "oldSecurePassword",
  "newPassword": "newSecurePassword"
}
```

Response:
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

#### Get User Statistics

```
GET /users/me/stats
```

Response:
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
      },
      // more activities...
    ]
  }
}
```

#### List All Users

```
GET /users
```

Query Parameters:
- `page`: Page number for pagination
- `limit`: Number of items per page
- `q`: Search query

Response:
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_123",
        "email": "john.doe@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "position": "CTO",
        "department": "Engineering",
        "avatar": "/placeholder.svg"
      },
      // more users...
    ]
  }
}
```

#### Get User by ID

```
GET /users/:userId
```

Response:
```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "user": {
      "id": "user_123",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "position": "CTO",
      "department": "Engineering",
      "avatar": "/placeholder.svg",
      "createdAt": "2023-01-15T00:00:00Z",
      "lastActive": "2 hours ago"
    }
  }
}
```

## Team

### Team Endpoints

#### List Team Members

```
GET /team
```

Query Parameters:
- `page`: Page number for pagination
- `limit`: Number of items per page
- `q`: Search query

Response:
```json
{
  "status": "success",
  "data": {
    "total": 8,
    "pages": 1,
    "currentPage": 1,
    "members": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john.doe@company.com",
        "role": "Admin",
        "avatar": "/placeholder.svg",
        "initials": "JD",
        "joinedDate": "2023-01-15",
        "lastActive": "2 hours ago",
        "jobsPosted": 8,
        "interviewsReviewed": 45,
        "reportsRead": 32
      },
      // more team members...
    ]
  }
}
```

#### Get Team Member Details

```
GET /team/:memberId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john.doe@company.com",
    "role": "Admin",
    "avatar": "/placeholder.svg",
    "initials": "JD",
    "joinedDate": "2023-01-15",
    "lastActive": "2 hours ago",
    "jobsPosted": 8,
    "interviewsReviewed": 45,
    "reportsRead": 32,
    "phone": "+1234567890",
    "department": "Engineering",
    "position": "CTO"
  }
}
```

#### Invite Team Member

```
POST /team/invite
```

Request Body:
```json
{
  "email": "new.member@company.com",
  "role": "Recruiter",
  "message": "Join our team on Vyre!"
}
```

Response:
```json
{
  "status": "success",
  "message": "Invitation sent successfully",
  "data": {
    "inviteId": "invite_123",
    "email": "new.member@company.com"
  }
}
```

#### Update Team Member

```
PUT /team/:memberId
```

Request Body:
```json
{
  "role": "Recruiter",
  "department": "HR",
  "position": "Senior Recruiter"
}
```

Response:
```json
{
  "status": "success",
  "message": "Team member updated successfully",
  "data": {
    "memberId": "user_123"
  }
}
```

#### Delete Team Member

```
DELETE /team/:memberId
```

Response:
```json
{
  "status": "success",
  "message": "Team member removed successfully"
}
```

## Settings

### Settings Endpoints

#### Get Company Settings

```
GET /settings/company
```

Response:
```json
{
  "status": "success",
  "data": {
    "companyName": "Acme Inc",
    "logoUrl": "/placeholder-logo.svg",
    "website": "https://acme.com",
    "industry": "Technology",
    "companySize": "51-200",
    "description": "We are a leading technology company focused on innovation and excellence."
  }
}
```

#### Update Company Settings

```
PUT /settings/company
```

Request Body:
```json
{
  "companyName": "Acme Inc",
  "logoUrl": "/uploads/acme-logo.svg",
  "website": "https://acme.com",
  "industry": "Technology",
  "companySize": "51-200",
  "description": "We are a leading technology company focused on innovation and excellence."
}
```

Response:
```json
{
  "status": "success",
  "message": "Company settings updated successfully",
  "data": {
    "companyName": "Acme Inc",
    "logoUrl": "/uploads/acme-logo.svg"
  }
}
```

#### Get Interview Preferences

```
GET /settings/interview-preferences
```

Response:
```json
{
  "status": "success",
  "data": {
    "emailNotifications": true,
    "autoScheduleInterviews": false,
    "sendReminderEmails": true,
    "reminderTime": 24,
    "defaultInterviewDuration": 45,
    "defaultQuestionBank": [
      "Tell us about your experience with...",
      "How would you handle..."
    ]
  }
}
```

#### Update Interview Preferences

```
PUT /settings/interview-preferences
```

Request Body:
```json
{
  "emailNotifications": true,
  "autoScheduleInterviews": true,
  "sendReminderEmails": true,
  "reminderTime": 12,
  "defaultInterviewDuration": 60,
  "defaultQuestionBank": [
    "Tell us about your experience with...",
    "How would you handle..."
  ]
}
```

Response:
```json
{
  "status": "success",
  "message": "Interview preferences updated successfully"
}
```

#### Get Integrations

```
GET /settings/integrations
```

Response:
```json
{
  "status": "success",
  "data": {
    "integrations": [
      {
        "id": "integration_123",
        "name": "LinkedIn",
        "status": "connected",
        "lastSync": "2023-06-01T10:00:00Z"
      },
      {
        "id": "integration_124",
        "name": "Google Calendar",
        "status": "connected",
        "lastSync": "2023-06-10T15:30:00Z"
      },
      {
        "id": "integration_125",
        "name": "Slack",
        "status": "disconnected",
        "lastSync": null
      }
    ]
  }
}
```

#### Connect Integration

```
POST /settings/integrations/:integrationId/connect
```

Request Body:
```json
{
  "authToken": "oauth_token_here",
  "refreshToken": "refresh_token_here"
}
```

Response:
```json
{
  "status": "success",
  "message": "Integration connected successfully",
  "data": {
    "integrationId": "integration_125",
    "status": "connected"
  }
}
```

#### Disconnect Integration

```
POST /settings/integrations/:integrationId/disconnect
```

Response:
```json
{
  "status": "success",
  "message": "Integration disconnected successfully",
  "data": {
    "integrationId": "integration_123",
    "status": "disconnected"
  }
}
```

## Notifications

### Notification Endpoints

#### List Notifications

```
GET /notifications
```

Query Parameters:
- `read`: Filter by read status (true, false)
- `page`: Page number for pagination
- `limit`: Number of items per page

Response:
```json
{
  "status": "success",
  "data": {
    "total": 12,
    "pages": 1,
    "currentPage": 1,
    "notifications": [
      {
        "id": "notification_123",
        "type": "interview_reminder",
        "title": "Interview Reminder",
        "message": "You have 3 interviews scheduled for tomorrow.",
        "read": false,
        "createdAt": "2023-06-22T10:00:00Z"
      },
      {
        "id": "notification_124",
        "type": "job_expiry",
        "title": "Job Posting Expiring",
        "message": "The \"Senior Product Designer\" job posting will expire in 2 days.",
        "read": false,
        "createdAt": "2023-06-21T15:30:00Z"
      },
      // more notifications...
    ]
  }
}
```

#### Mark Notification as Read

```
PATCH /notifications/:notificationId/read
```

Response:
```json
{
  "status": "success",
  "message": "Notification marked as read",
  "data": {
    "notificationId": "notification_123",
    "read": true
  }
}
```

#### Mark All Notifications as Read

```
PATCH /notifications/read-all
```

Response:
```json
{
  "status": "success",
  "message": "All notifications marked as read"
}
```

#### Delete Notification

```
DELETE /notifications/:notificationId
```

Response:
```json
{
  "status": "success",
  "message": "Notification deleted successfully"
}
```

## VyreBot

### VyreBot Endpoints

#### Send Message to VyreBot

```
POST /vyrebot/message
```

Request Body:
```json
{
  "message": "Show me the latest candidates for Frontend Developer"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "messageId": "message_123",
    "response": "I found 3 shortlisted candidates for Frontend Developer. Would you like to see their profiles or interview reports?",
    "suggestions": [
      "Show profiles",
      "Show interview reports",
      "Schedule interviews"
    ],
    "timestamp": "2023-06-23T14:05:00Z"
  }
}
```

#### Get VyreBot Chat History

```
GET /vyrebot/history
```

Query Parameters:
- `limit`: Number of messages to return

Response:
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "id": "message_122",
        "content": "Show me the latest candidates for Frontend Developer",
        "sender": "user",
        "timestamp": "2023-06-23T14:05:00Z"
      },
      {
        "id": "message_123",
        "content": "I found 3 shortlisted candidates for Frontend Developer. Would you like to see their profiles or interview reports?",
        "sender": "bot",
        "timestamp": "2023-06-23T14:05:05Z",
        "suggestions": [
          "Show profiles",
          "Show interview reports",
          "Schedule interviews"
        ]
      },
      // more messages...
    ]
  }
}
```

## Files

### File Endpoints

#### Upload File

```
POST /files/upload
```

Form Data:
- `file`: The file to upload
- `type`: Type of file (resume, logo, avatar)
- `relatedId` (optional): ID of related entity (candidate, job, user)

Response:
```json
{
  "status": "success",
  "message": "File uploaded successfully",
  "data": {
    "fileId": "file_123",
    "fileName": "sarah-johnson-resume.pdf",
    "fileUrl": "https://storage.vyre.io/resumes/sarah-johnson-resume.pdf",
    "fileSize": 1045678,
    "mimeType": "application/pdf",
    "uploadedAt": "2023-06-23T14:10:00Z"
  }
}
```

#### Get File

```
GET /files/:fileId
```

Response:
Binary file stream with appropriate Content-Type header.

#### Delete File

```
DELETE /files/:fileId
```

Response:
```json
{
  "status": "success",
  "message": "File deleted successfully"
}
```

## Help Center

### Help Center Endpoints

#### List FAQ Categories

```
GET /help/faq/categories
```

Response:
```json
{
  "status": "success",
  "data": {
    "categories": [
      {
        "id": "category_123",
        "name": "Getting Started",
        "articleCount": 5
      },
      {
        "id": "category_124",
        "name": "Jobs Management",
        "articleCount": 8
      },
      {
        "id": "category_125",
        "name": "Interview Process",
        "articleCount": 10
      },
      // more categories...
    ]
  }
}
```

#### Get FAQ Articles by Category

```
GET /help/faq/categories/:categoryId/articles
```

Response:
```json
{
  "status": "success",
  "data": {
    "categoryName": "Interview Process",
    "articles": [
      {
        "id": "article_123",
        "title": "How do I invite candidates to interviews?",
        "excerpt": "You can invite candidates directly from the job posting or through the interviews section.",
        "updatedAt": "2023-05-15T10:00:00Z"
      },
      {
        "id": "article_124",
        "title": "Can I customize interview questions?",
        "excerpt": "Yes, you can create custom interview templates in the job posting flow.",
        "updatedAt": "2023-05-10T14:30:00Z"
      },
      // more articles...
    ]
  }
}
```

#### Get FAQ Article

```
GET /help/faq/articles/:articleId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "article_123",
    "title": "How do I invite candidates to interviews?",
    "content": "You can invite candidates directly from the job posting or through the interviews section. Simply click \"Invite Candidate\" and enter their email address.\n\nThe system will automatically send them an invitation email with a link to schedule their interview based on your availability.",
    "category": {
      "id": "category_125",
      "name": "Interview Process"
    },
    "relatedArticles": [
      {
        "id": "article_124",
        "title": "Can I customize interview questions?"
      },
      {
        "id": "article_125",
        "title": "How to schedule group interviews"
      }
    ],
    "createdAt": "2023-04-12T09:30:00Z",
    "updatedAt": "2023-05-15T10:00:00Z"
  }
}
```

#### Submit Support Ticket

```
POST /help/support/tickets
```

Request Body:
```json
{
  "subject": "Cannot schedule interviews",
  "message": "I'm trying to schedule an interview but getting an error",
  "priority": "medium",
  "category": "technical_issue"
}
```

Response:
```json
{
  "status": "success",
  "message": "Support ticket submitted successfully",
  "data": {
    "ticketId": "ticket_123",
    "estimatedResponseTime": "2 hours"
  }
}
```

#### Get Support Tickets

```
GET /help/support/tickets
```

Response:
```json
{
  "status": "success",
  "data": {
    "tickets": [
      {
        "id": "ticket_123",
        "subject": "Cannot schedule interviews",
        "status": "open",
        "priority": "medium",
        "createdAt": "2023-06-23T11:30:00Z",
        "lastUpdated": "2023-06-23T11:30:00Z"
      },
      // more tickets...
    ]
  }
}
```

#### Get Support Ticket Details

```
GET /help/support/tickets/:ticketId
```

Response:
```json
{
  "status": "success",
  "data": {
    "id": "ticket_123",
    "subject": "Cannot schedule interviews",
    "message": "I'm trying to schedule an interview but getting an error",
    "status": "open",
    "priority": "medium",
    "category": "technical_issue",
    "createdAt": "2023-06-23T11:30:00Z",
    "lastUpdated": "2023-06-23T11:30:00Z",
    "responses": [
      {
        "id": "response_123",
        "message": "Thank you for your report. Can you please provide more details about the error message?",
        "from": "support",
        "agentName": "Support Team",
        "createdAt": "2023-06-23T12:15:00Z"
      },
      // more responses...
    ]
  }
}
```

#### Reply to Support Ticket

```
POST /help/support/tickets/:ticketId/replies
```

Request Body:
```json
{
  "message": "The error says 'Calendar integration failed'"
}
```

Response:
```json
{
  "status": "success",
  "message": "Reply added successfully",
  "data": {
    "replyId": "response_124"
  }
}
```

## System Status

### System Status Endpoints

#### Get System Status

```
GET /system/status
```

Response:
```json
{
  "status": "success",
  "data": {
    "services": [
      {
        "name": "API Services",
        "status": "operational",
        "uptime": 99.9,
        "lastIssue": "2023-05-10T14:00:00Z"
      },
      {
        "name": "Interview Platform",
        "status": "operational",
        "uptime": 99.8,
        "lastIssue": "2023-05-15T08:00:00Z"
      },
      {
        "name": "Database",
        "status": "operational",
        "uptime": 100,
        "lastIssue": null
      },
      {
        "name": "File Storage",
        "status": "operational",
        "uptime": 99.95,
        "lastIssue": "2023-06-01T12:00:00Z"
      }
    ],
    "lastUpdated": "2023-06-23T14:30:00Z"
  }
}
```

## Error Handling

All endpoints will return appropriate HTTP status codes:

- 200 OK: Successful operation
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid input
- 401 Unauthorized: Authentication required or token expired
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict
- 422 Unprocessable Entity: Validation errors
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

Error responses will follow this format:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is already in use"
    }
  ],
  "code": "VALIDATION_ERROR"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are based on the user's plan and are included in the response headers:

- `X-Rate-Limit-Limit`: The number of allowed requests in the current period
- `X-Rate-Limit-Remaining`: The number of remaining requests in the current period
- `X-Rate-Limit-Reset`: The time at which the current rate limit window resets in UTC epoch seconds

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)

Responses include pagination metadata:

```json
{
  "status": "success",
  "data": {
    "total": 132,
    "pages": 7,
    "currentPage": 1,
    "items": [
      // items...
    ]
  }
}
```

## Implementation Notes

### Database Structure

The database will use MongoDB for storing application data with the following main collections:

1. `users` - User accounts and authentication information
2. `refreshTokens` - Storage of valid refresh tokens
3. `companies` - Organization information
4. `jobs` - Job listings and requirements
5. `candidates` - Candidate profiles and applications
6. `interviews` - Interview schedules and feedback
7. `reports` - Candidate assessment reports
8. `notifications` - System notifications
9. `files` - Metadata for uploaded files
10. `messages` - VyreBot chat history
11. `settings` - Application settings
12. `teams` - Team members and permissions
13. `helpCenter` - Help articles and support tickets

### Authentication and Security

- JWT-based authentication with dual token system:
  - Access tokens with 24-hour expiry
  - Refresh tokens with 30-day expiry and rotation
  - Refresh token reuse detection for security
- Role-based access control (RBAC)
- HTTPS required for all API endpoints
- All PII (personally identifiable information) will be encrypted at rest
- Input validation and sanitization for all endpoints
- CORS configuration for secure frontend-backend communication
- Regular security audits and penetration testing

### Deployment

- Containerized using Docker
- CI/CD pipeline using GitHub Actions
- Separate environments for development, staging, and production
- Auto-scaling based on traffic
- Regular database backups
- Comprehensive logging and monitoring

### Testing

- Unit tests covering individual functions and methods
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Load testing to ensure performance under heavy usage
- Security testing including OWASP Top 10 vulnerabilities

### API Documentation

Full API documentation will be available through:
1. Swagger/OpenAPI specification at `/api-docs`
2. Postman collection for easy API testing and exploration
3. Interactive documentation with examples and try-it-now functionality