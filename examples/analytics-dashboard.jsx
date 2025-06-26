import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

const AnalyticsDashboard = () => {
  // State for different analytics data
  const [dashboardData, setDashboardData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [sourceData, setSourceData] = useState(null);
  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from storage
  const token = localStorage.getItem('token');
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.vyre.com/v1';

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Make all API calls in parallel for better performance
        const [dashboardResponse, activityResponse, sourceResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/dashboard`, config),
          axios.get(`${API_BASE_URL}/analytics/activity-summary?period=${period}`, config),
          axios.get(`${API_BASE_URL}/analytics/source-effectiveness`, config)
        ]);

        setDashboardData(dashboardResponse.data.data);
        setActivityData(activityResponse.data.data);
        setSourceData(sourceResponse.data.data);
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch analytics data';
        console.error('Analytics error:', errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [token, period, API_BASE_URL]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-error">
        <h2>Error Loading Analytics</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <h1>Recruitment Analytics Dashboard</h1>
        <div className="period-selector">
          <button 
            className={period === 'week' ? 'active' : ''} 
            onClick={() => handlePeriodChange('week')}
          >
            Week
          </button>
          <button 
            className={period === 'month' ? 'active' : ''} 
            onClick={() => handlePeriodChange('month')}
          >
            Month
          </button>
          <button 
            className={period === 'quarter' ? 'active' : ''} 
            onClick={() => handlePeriodChange('quarter')}
          >
            Quarter
          </button>
          <button 
            className={period === 'year' ? 'active' : ''} 
            onClick={() => handlePeriodChange('year')}
          >
            Year
          </button>
        </div>
      </div>

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
        <div className="analytics-section">
          <h2>Activity Summary ({activityData.summary.period})</h2>
          
          <div className="activity-metrics">
            <div className="activity-metric">
              <h4>New Jobs</h4>
              <p>{activityData.summary.newJobs}</p>
            </div>
            <div className="activity-metric">
              <h4>New Candidates</h4>
              <p>{activityData.summary.newCandidates}</p>
            </div>
            <div className="activity-metric">
              <h4>Scheduled Interviews</h4>
              <p>{activityData.summary.scheduledInterviews}</p>
            </div>
            <div className="activity-metric">
              <h4>Completed Interviews</h4>
              <p>{activityData.summary.completedInterviews}</p>
            </div>
            <div className="activity-metric">
              <h4>Active Users</h4>
              <p>{activityData.summary.activeUsers}</p>
            </div>
          </div>
          
          {/* Daily Activity Chart */}
          <div className="chart-container">
            <h3>Daily Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={activityData.dailyActivity}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="jobs" stroke="#8884d8" name="Jobs" />
                <Line type="monotone" dataKey="candidates" stroke="#82ca9d" name="Candidates" />
                <Line type="monotone" dataKey="interviews" stroke="#ffc658" name="Interviews" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Source Effectiveness Section */}
      {sourceData && (
        <div className="analytics-section">
          <h2>Source Effectiveness (Last {sourceData.timeRange} days)</h2>
          
          {/* Source Data Visualization */}
          <div className="chart-container">
            <h3>Total Candidates by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData.sources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalCandidates" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="chart-container">
            <h3>Hire Rate by Source</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData.sources}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="hireRate" fill="#82ca9d" />
                <Bar dataKey="interviewRate" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Source Comparison Table */}
          <div className="source-table">
            <h3>Source Comparison</h3>
            <table>
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Total</th>
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
        </div>
      )}
      
      <div className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <button onClick={() => window.location.reload()} className="refresh-button">
          Refresh Data
        </button>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
