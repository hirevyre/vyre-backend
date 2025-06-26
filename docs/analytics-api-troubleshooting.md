# Analytics API Troubleshooting Guide

This guide provides solutions for common issues when working with the Vyre Analytics API endpoints.

## Table of Contents
1. [Common Error Codes](#common-error-codes)
2. [Data Not Loading](#data-not-loading)
3. [ObjectId Errors](#objectid-errors)
4. [Performance Issues](#performance-issues)
5. [Authentication Problems](#authentication-problems)
6. [Missing or Incomplete Data](#missing-or-incomplete-data)
7. [Debugging Tips](#debugging-tips)

## Common Error Codes

| Status Code | Error Message | Possible Solution |
|-------------|--------------|------------------|
| 401 | Unauthorized | Your JWT token is missing, expired, or invalid. Generate a new token by logging in again. |
| 403 | Forbidden | Your user account doesn't have permission to access this data. Contact your administrator to update your permissions. |
| 404 | Route not found | Check the endpoint URL. Ensure you're using the correct API version (v1) and endpoint path. |
| 500 | Failed to retrieve analytics | Server-side error. Check server logs for more details. This might indicate an issue with database connections or aggregation operations. |

## Data Not Loading

### Problem: Analytics endpoints returning empty data or zeroes

**Possible causes:**
1. No data exists for the specified time period
2. Company ID mismatch
3. Database query issues

**Solutions:**
1. Verify that data exists for the selected time period by trying a broader range
2. Ensure your user account is properly associated with your company
3. Check MongoDB connection and indexes on analytics collections
4. Review server logs for aggregation pipeline errors

### Problem: Missing specific metrics in responses

**Solutions:**
1. Ensure all required collections are populated (Jobs, Candidates, Interviews, etc.)
2. Check if metrics calculation logic is working correctly in the controller
3. Verify that all aggregation stages are completing successfully

## ObjectId Errors

### Problem: "Class constructor ObjectId cannot be invoked without 'new'"

This error occurs when MongoDB ObjectId is used without the `new` keyword in aggregation pipelines.

**Solutions:**
1. Ensure all `mongoose.Types.ObjectId()` calls use the `new` keyword:
   ```javascript
   // Incorrect
   companyId: mongoose.Types.ObjectId(companyId)
   
   // Correct
   companyId: new mongoose.Types.ObjectId(companyId)
   ```

2. If using a MongoDB version >= 4.0, consider using the `$toObjectId` operator in aggregation pipelines:
   ```javascript
   { $match: { companyId: { $eq: { $toObjectId: companyId } } } }
   ```

### Problem: "Cast to ObjectId failed for value X at path _id"

**Solutions:**
1. Ensure IDs passed to endpoints are valid 24-character hexadecimal strings
2. Add validation for IDs in your route handlers before trying to use them
3. Use `mongoose.isValidObjectId(id)` to check validity before queries

## Performance Issues

### Problem: Slow response times for analytics endpoints

**Solutions:**
1. Add appropriate indexes to MongoDB collections:
   ```javascript
   // Example indexes for analytics queries
   db.candidates.createIndex({ companyId: 1, createdAt: 1 });
   db.jobs.createIndex({ companyId: 1, createdAt: 1 });
   db.interviews.createIndex({ companyId: 1, scheduledDate: 1 });
   ```

2. Optimize your aggregation pipelines:
   - Use `$match` early in the pipeline to reduce documents processed
   - Avoid multiple lookups when possible
   - Use projection (`$project`) to limit fields

3. Implement caching for analytics data that doesn't change frequently:
   - Use Redis or another caching solution
   - Set appropriate TTL (time to live) values based on data update frequency

4. Consider pre-aggregating commonly used analytics data during off-hours

## Authentication Problems

### Problem: "jwt must be provided" or "invalid signature"

**Solutions:**
1. Check that your authentication token is being sent correctly in the Authorization header
2. Ensure token hasn't expired (default expiration is 24 hours)
3. Verify that your frontend code is storing and sending the token correctly:
   ```javascript
   // Correct way to send token
   const config = {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   };
   ```

4. If using multiple environments, ensure the JWT secret is correctly set in each environment

## Missing or Incomplete Data

### Problem: Analytics showing incomplete data for some metrics

**Solutions:**
1. Check if all required fields are populated in your database documents
2. Ensure date ranges are correctly formatted in ISO format
3. Verify that field names in aggregation pipelines match your schema
4. Check that status values (e.g., 'completed', 'hired') are consistently cased

### Problem: Daily activity data showing gaps

**Solutions:**
1. The formatDailyActivityData helper function should be creating entries for all dates in the range
2. Ensure your date parsing and formatting is consistent throughout the code
3. Check that your date comparison logic accounts for timezone differences

## Debugging Tips

### Enable Verbose Logging for Analytics Operations

Add this to your analytics controller to enhance debugging:

```javascript
// Add this at the start of any analytics controller method
console.log(`[ANALYTICS DEBUG] Requesting ${req.path} with params:`, {
  query: req.query,
  params: req.params,
  user: {
    id: req.user.id,
    companyId: req.user.companyId
  }
});

// Log the MongoDB queries being executed
mongoose.set('debug', true);
```

### Check Aggregation Pipeline Results at Each Stage

When troubleshooting complex aggregations, break them down and test each stage:

```javascript
// Testing an aggregation pipeline stage by stage
const stages = [
  { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
  { $group: { _id: "$source", totalCandidates: { $sum: 1 } } }
];

// Test each stage incrementally
let result = await Candidate.aggregate([stages[0]]);
console.log("After $match stage:", result.length);

result = await Candidate.aggregate([stages[0], stages[1]]);
console.log("After $group stage:", result);
```

### Verify Data Integrity

If analytics are showing unexpected results, directly query collections to verify data:

```javascript
// Example: Check if candidates exist for a company
const candidateCount = await Candidate.countDocuments({ 
  companyId: req.user.companyId 
});
console.log(`Company ${req.user.companyId} has ${candidateCount} candidates`);
```

## Getting Help

If you're still experiencing issues after trying these troubleshooting steps, please contact the Vyre API development team with:

1. The specific endpoint that's failing
2. Request parameters and headers (excluding auth tokens)
3. Complete error message and stack trace
4. User ID and company ID experiencing the issue
5. Timestamp when the issue occurred

Contact: `api-support@vyre.com`
