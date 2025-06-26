# Analytics API Integration Guide

## Overview

The Vyre Analytics API provides comprehensive data and metrics about your recruitment process, candidate pipeline, and team performance. This document provides guidelines on how to integrate with the analytics endpoints, complete with examples and troubleshooting tips.

## Base URL

All API endpoints are prefixed with `/v1/analytics`.

## Authentication

All analytics endpoints require authentication. Include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Available Endpoints

### 1. Dashboard Analytics

**Endpoint:** `GET /v1/analytics/dashboard`

**Description:** Retrieves overview metrics for the dashboard including total jobs, candidates, interviews completed, and candidates shortlisted.

**Query Parameters:** None

**Response:**

```json
{
  "status": "success",
  "data": {
    "totalJobs": 15,
    "totalCandidates": 120,
    "interviewsCompleted": 45,
    "candidatesShortlisted": 28,
    "latestJobs": [
      {
        "_id": "685c28a524bcada8db894b10",
        "jobTitle": "Frontend Developer",
        "department": "Engineering",
        "location": "Remote",
        "jobType": "Full-time",
        "status": "Open",
        "createdAt": "2025-06-20T12:00:00.000Z"
      }
    ],
    "latestCandidates": [
      {
        "_id": "685c28a524bcada8db894b20",
        "firstName": "Jane",
        "lastName": "Smith",
        "email": "jane@example.com",
        "status": "Screening",
        "appliedFor": "Frontend Developer",
        "createdAt": "2025-06-25T12:00:00.000Z"
      }
    ]
  }
}
```

### 2. Recruitment Analytics

**Endpoint:** `GET /v1/analytics/recruitment`

**Description:** Retrieves detailed recruitment metrics including time-to-hire, candidate scores, and recruitment funnel data.

**Query Parameters:**

- `period`: Time period for data (week, month, quarter). Default: `month`

**Response:**

```json
{
  "status": "success",
  "data": {
    "timeToHire": {
      "average": 21,
      "trend": -12
    },
    "candidateScore": {
      "average": 85,
      "trend": 4
    },
    "interviewToHireRatio": "1:6",
    "trendImprovement": -8,
    "mostSourcedRole": {
      "title": "Frontend Developer",
      "count": 15
    },
    "activityData": [
      { "month": "Jan", "hires": 5 },
      { "month": "Feb", "hires": 8 }
    ],
    "roleData": [
      { "name": "Frontend Dev", "value": 32 },
      { "name": "Backend Dev", "value": 28 }
    ]
  }
}
```

### 3. Job Analytics

**Endpoint:** `GET /v1/analytics/jobs/:jobId`

**Description:** Retrieves analytics for a specific job posting.

**URL Parameters:**

- `jobId`: ID of the job to get analytics for

**Response:**

```json
{
  "status": "success",
  "data": {
    "applications": 25,
    "interviewsScheduled": 15,
    "interviewsCompleted": 12,
    "shortlisted": 8,
    "rejected": 10,
    "timeToFill": 21,
    "candidateSourceBreakdown": [
      { "source": "LinkedIn", "count": 12 },
      { "source": "Company Website", "count": 8 },
      { "source": "Indeed", "count": 4 }
    ],
    "skillsMatch": [
      { "skill": "React.js", "match": 85 },
      { "skill": "TypeScript", "match": 75 }
    ]
  }
}
```

### 4. Activity Summary

**Endpoint:** `GET /v1/analytics/activity-summary`

**Description:** Retrieves a summary of recruitment activities for a specific period.

**Query Parameters:**

- `period`: Time period for data (week, month, quarter, year). Default: `month`

**Response:**

```json
{
  "status": "success",
  "message": "Activity summary retrieved successfully",
  "data": {
    "summary": {
      "newJobs": 5,
      "newCandidates": 30,
      "scheduledInterviews": 20,
      "completedInterviews": 15,
      "activeUsers": 8,
      "period": "month"
    },
    "dailyActivity": [
      {
        "date": "2025-05-28",
        "jobs": 1,
        "candidates": 5,
        "interviews": 3
      },
      {
        "date": "2025-05-29",
        "jobs": 0,
        "candidates": 3,
        "interviews": 2
      }
    ]
  }
}
```

### 5. Source Effectiveness

**Endpoint:** `GET /v1/analytics/source-effectiveness`

**Description:** Analyzes the effectiveness of different candidate sources.

**Query Parameters:**

- `timeRange`: Number of days to analyze. Default: `30`

**Response:**

```json
{
  "status": "success",
  "message": "Source effectiveness retrieved successfully",
  "data": {
    "timeRange": 30,
    "sources": [
      {
        "source": "LinkedIn",
        "totalCandidates": 45,
        "interviewed": 25,
        "hired": 8,
        "rejected": 15,
        "interviewRate": 55.6,
        "hireRate": 17.8
      },
      {
        "source": "Indeed",
        "totalCandidates": 30,
        "interviewed": 15,
        "hired": 5,
        "rejected": 10,
        "interviewRate": 50.0,
        "hireRate": 16.7
      }
    ]
  }
}
```

## Integration Examples

### React + Axios Example

Below is an example of how to fetch analytics data in a React application using Axios:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Configure headers with authentication
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Fetch dashboard analytics
        const dashboardResponse = await axios.get(
          'https://your-api-url.com/v1/analytics/dashboard',
          config
        );

        // Fetch activity summary for the last month
        const activityResponse = await axios.get(
          'https://your-api-url.com/v1/analytics/activity-summary?period=month',
          config
        );

        // Fetch source effectiveness
        const sourceResponse = await axios.get(
          'https://your-api-url.com/v1/analytics/source-effectiveness',
          config
        );

        setDashboardData(dashboardResponse.data.data);
        setActivityData(activityResponse.data.data);
        setSourceData(sourceResponse.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch analytics data');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token]);

  if (loading) return <div>Loading analytics data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="analytics-dashboard">
      <h1>Recruitment Analytics</h1>
      
      {/* Dashboard Overview Section */}
      {dashboardData && (
        <div className="metrics-overview">
          <div className="metric-card">
            <h3>Total Jobs</h3>
            <p className="metric-value">{dashboardData.totalJobs}</p>
          </div>
          <div className="metric-card">
            <h3>Total Candidates</h3>
            <p className="metric-value">{dashboardData.totalCandidates}</p>
          </div>
          <div className="metric-card">
            <h3>Interviews Completed</h3>
            <p className="metric-value">{dashboardData.interviewsCompleted}</p>
          </div>
          <div className="metric-card">
            <h3>Candidates Shortlisted</h3>
            <p className="metric-value">{dashboardData.candidatesShortlisted}</p>
          </div>
        </div>
      )}
      
      {/* Activity Summary Section */}
      {activityData && (
        <div className="activity-summary">
          <h2>Activity Summary (Past Month)</h2>
          <div className="summary-metrics">
            <p>New Jobs: {activityData.summary.newJobs}</p>
            <p>New Candidates: {activityData.summary.newCandidates}</p>
            <p>Scheduled Interviews: {activityData.summary.scheduledInterviews}</p>
            <p>Completed Interviews: {activityData.summary.completedInterviews}</p>
          </div>
          
          {/* This would typically be a chart component */}
          <div className="activity-chart">
            {/* Render chart using activityData.dailyActivity */}
            <p>Chart showing daily activity would go here</p>
          </div>
        </div>
      )}
      
      {/* Source Effectiveness Section */}
      {sourceData && (
        <div className="source-effectiveness">
          <h2>Source Effectiveness (Last {sourceData.timeRange} days)</h2>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Total Candidates</th>
                <th>Interviewed</th>
                <th>Hired</th>
                <th>Interview Rate</th>
                <th>Hire Rate</th>
              </tr>
            </thead>
            <tbody>
              {sourceData.sources.map((source, index) => (
                <tr key={index}>
                  <td>{source.source}</td>
                  <td>{source.totalCandidates}</td>
                  <td>{source.interviewed}</td>
                  <td>{source.hired}</td>
                  <td>{source.interviewRate}%</td>
                  <td>{source.hireRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
```

### Fetching and Visualizing Job Analytics

Here's an example of how to fetch analytics for a specific job and visualize the data:

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const JobAnalytics = ({ jobId }) => {
  const [jobAnalytics, setJobAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchJobAnalytics = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        const response = await axios.get(
          `https://your-api-url.com/v1/analytics/jobs/${jobId}`,
          config
        );

        setJobAnalytics(response.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch job analytics');
        setLoading(false);
      }
    };

    fetchJobAnalytics();
  }, [jobId, token]);

  if (loading) return <div>Loading job analytics...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!jobAnalytics) return <div>No analytics data available for this job</div>;

  return (
    <div className="job-analytics">
      <h1>Job Analytics</h1>
      
      <div className="metrics-overview">
        <div className="metric-card">
          <h3>Applications</h3>
          <p className="metric-value">{jobAnalytics.applications}</p>
        </div>
        <div className="metric-card">
          <h3>Interviews Scheduled</h3>
          <p className="metric-value">{jobAnalytics.interviewsScheduled}</p>
        </div>
        <div className="metric-card">
          <h3>Interviews Completed</h3>
          <p className="metric-value">{jobAnalytics.interviewsCompleted}</p>
        </div>
        <div className="metric-card">
          <h3>Time to Fill</h3>
          <p className="metric-value">{jobAnalytics.timeToFill} days</p>
        </div>
      </div>
      
      <div className="analytics-charts">
        {/* Candidate Status Chart */}
        <div className="chart-container">
          <h3>Candidate Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Shortlisted', value: jobAnalytics.shortlisted },
                  { name: 'Rejected', value: jobAnalytics.rejected },
                  { name: 'In Process', value: jobAnalytics.applications - (jobAnalytics.shortlisted + jobAnalytics.rejected) }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Source Breakdown Chart */}
        <div className="chart-container">
          <h3>Candidate Source Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={jobAnalytics.candidateSourceBreakdown}>
              <XAxis dataKey="source" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Skills Match Chart */}
        <div className="chart-container">
          <h3>Skills Match</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              layout="vertical" 
              data={jobAnalytics.skillsMatch}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="skill" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="match" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default JobAnalytics;
```

## Error Handling

The Analytics API uses the following error format:

```json
{
  "status": "error",
  "message": "Error message here",
  "code": "ERROR_CODE"  // Optional error code
}
```

### Common Errors

| Status Code | Error Message | Possible Cause | Solution |
|-------------|--------------|----------------|----------|
| 401 | Unauthorized | Invalid or expired token | Refresh your authentication token |
| 403 | Forbidden | User doesn't have permissions | Check user role and permissions |
| 404 | Resource not found | Invalid ID or endpoint | Verify the endpoint and parameters |
| 500 | Failed to retrieve analytics | Server-side error | Check server logs, retry later |

## Performance Considerations

1. **Caching**: Consider caching analytics responses on the client-side for frequently accessed but infrequently changing data.

2. **Pagination**: For endpoints that return large datasets, use pagination parameters where available.

3. **Time Period Selection**: Use the narrowest time period that meets your needs to reduce data payload size.

4. **Parallel Requests**: When loading a dashboard with multiple analytics widgets, consider using `Promise.all()` to make parallel requests.

## Best Practices

1. **Error Handling**: Always implement robust error handling for analytics API calls, providing clear feedback to users.

2. **Loading States**: Show loading indicators during data fetching to improve user experience.

3. **Data Refresh**: Implement refresh functionality to update analytics data without a full page reload.

4. **Progressive Loading**: Load the most critical analytics first, then less important metrics as needed.

5. **Responsive Visualization**: Ensure your analytics visualizations are responsive for various screen sizes.

## Troubleshooting

### Common Issues

1. **No data returned**: 
   - Check that the user has permission to view the requested data
   - Verify that there is data for the specified time period
   - Confirm that company ID association is correct

2. **Slow response times**: 
   - Check if you're requesting too large a date range
   - Consider implementing caching
   - Use more specific endpoints instead of dashboard-wide ones

3. **Authentication errors**: 
   - Ensure your JWT token is valid and not expired
   - Check that the token includes necessary claims (user ID, company ID)

### Support

For any issues with the Analytics API, please contact the development team at `devteam@vyre.com` with:

- Specific endpoint being called
- Complete error message
- Request parameters
- Timestamp of the request

## API Versioning

The current version of the Analytics API is v1. Any breaking changes will be released under a new version number (e.g., v2).

## Rate Limiting

The Analytics API has a rate limit of 100 requests per minute per user. If you exceed this limit, you will receive a 429 (Too Many Requests) response.
