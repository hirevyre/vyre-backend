# Troubleshooting Guide: Company Settings Integration

This guide provides solutions to common issues encountered when integrating with the Vyre API company settings endpoints.

## Authentication Issues

### Problem: 401 Unauthorized Errors
**Symptoms:**
- API calls return 401 status code
- Error message "Token is invalid or expired"

**Possible Causes & Solutions:**
1. **Expired Access Token**
   - Access tokens expire after 24 hours
   - Use the refresh token to get a new access token:
   ```javascript
   try {
     const refreshToken = localStorage.getItem('refreshToken');
     const response = await axios.post(
       `${API_URL}/auth/refresh-token`,
       { refreshToken }
     );
     const newAccessToken = response.data.data.accessToken;
     localStorage.setItem('accessToken', newAccessToken);
     return newAccessToken;
   } catch (error) {
     // Handle refresh token failure
     console.error('Failed to refresh token:', error);
     // Redirect to login
     window.location.href = '/login';
   }
   ```

2. **Malformed Authorization Header**
   - Ensure the token is correctly formatted in the header:
   ```javascript
   axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
   ```
   - Check for extra spaces, missing "Bearer" prefix, or token corruption

3. **Invalid Token (JWT Verification Failure)**
   - The token might be tampered with or corrupted
   - Clear local storage and re-authenticate:
   ```javascript
   localStorage.clear();
   window.location.href = '/login';
   ```

### Problem: Refresh Token Not Working
**Symptoms:**
- Refresh token API call returns 400 or 401
- Error message "Invalid refresh token" or "Refresh token expired"

**Possible Causes & Solutions:**
1. **Expired Refresh Token**
   - Refresh tokens expire after 30 days
   - User needs to log in again

2. **Refresh Token Reuse**
   - API security measure detects token reuse (possibly compromised)
   - Force user to log in again
   - Implement better token storage to prevent simultaneous usage

## Permission Issues

### Problem: 403 Forbidden Errors
**Symptoms:**
- API calls return 403 status code
- Error message "Insufficient permissions" or "Admin access required"

**Possible Causes & Solutions:**
1. **User Not Admin**
   - Company settings may require admin role
   - Check user role and update UI accordingly:
   ```javascript
   if (!userIsAdmin) {
     disableEditingControls();
     showMessage('Only administrators can edit company settings');
   }
   ```

2. **Role Changed on Server**
   - User's role might have been changed by another admin
   - Fetch current user profile to get updated role information:
   ```javascript
   async function refreshUserProfile() {
     try {
       const response = await axios.get(
         `${API_URL}/users/me`,
         { headers: { Authorization: `Bearer ${accessToken}` } }
       );
       updateUserState(response.data.data.user);
     } catch (error) {
       console.error('Failed to refresh user profile:', error);
     }
   }
   ```

## Data Validation Issues

### Problem: 422 Validation Errors
**Symptoms:**
- API calls return 422 status code
- Error response contains validation details

**Possible Causes & Solutions:**
1. **Invalid Input Format**
   - Implement client-side validation before submission:
   ```javascript
   function validateCompanyData(data) {
     const errors = {};
     
     if (!data.companyName?.trim()) {
       errors.companyName = 'Company name is required';
     }
     
     if (data.website && !isValidUrl(data.website)) {
       errors.website = 'Invalid website URL format';
     }
     
     return { 
       isValid: Object.keys(errors).length === 0,
       errors 
     };
   }
   ```

2. **Missing Required Fields**
   - Check API documentation for required fields
   - Ensure all required fields are included in requests

3. **Invalid File Formats or Sizes**
   - For logo uploads, check file format restrictions
   - Implement client-side file validation:
   ```javascript
   function validateLogoFile(file) {
     const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
     const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
     
     if (!allowedTypes.includes(file.type)) {
       return 'Logo must be JPG, PNG, or SVG format';
     }
     
     if (file.size > maxSizeInBytes) {
       return 'Logo file size must be under 5MB';
     }
     
     return null; // No error
   }
   ```

## Network Issues

### Problem: Network Errors
**Symptoms:**
- API calls fail with "Network Error"
- No status code returned

**Possible Causes & Solutions:**
1. **Internet Connection Issues**
   - Implement offline detection:
   ```javascript
   window.addEventListener('offline', () => {
     showOfflineMessage('You are offline. Changes will be saved when you reconnect.');
   });

   window.addEventListener('online', () => {
     hideOfflineMessage();
     syncPendingChanges();
   });
   ```

2. **CORS Issues**
   - Check browser console for CORS errors
   - Ensure the frontend domain is allowed in the API's CORS configuration
   - Contact backend team if CORS issues persist

3. **API Server Down**
   - Implement health check to detect API availability:
   ```javascript
   async function checkApiHealth() {
     try {
       const response = await axios.get(`${API_URL}/system/status`);
       return response.data.data.services.some(s => 
         s.name === 'API Services' && s.status === 'operational'
       );
     } catch (error) {
       console.error('API health check failed:', error);
       return false;
     }
   }
   ```

## Data Loading Issues

### Problem: Empty or Incorrect Data
**Symptoms:**
- API request succeeds but returns empty or unexpected data
- Form fields not populating correctly

**Possible Causes & Solutions:**
1. **Data Transformation Issues**
   - Check response format against expected format
   - Add better error handling for unexpected data:
   ```javascript
   function safelyParseCompanyData(responseData) {
     // Set defaults for all expected fields
     const defaults = {
       companyName: '',
       logoUrl: '',
       website: '',
       industry: '',
       companySize: '',
       description: ''
     };
     
     // Use nullish coalescing to ensure missing fields use defaults
     const data = responseData?.data || {};
     
     return {
       ...defaults,
       ...data
     };
   }
   ```

2. **Race Conditions**
   - Use effect cleanup to prevent state updates after component unmount:
   ```javascript
   useEffect(() => {
     let isMounted = true;
     
     const fetchData = async () => {
       try {
         const response = await apiClient.get('/settings/company');
         if (isMounted) {
           setCompanyInfo(response.data.data);
         }
       } catch (error) {
         if (isMounted) {
           setError('Failed to load data');
         }
       } finally {
         if (isMounted) {
           setLoading(false);
         }
       }
     };
     
     fetchData();
     
     return () => {
       isMounted = false;
     };
   }, []);
   ```

## Update Issues

### Problem: Changes Not Saving
**Symptoms:**
- API call succeeds (200 OK) but changes don't persist
- Data reverts after page refresh

**Possible Causes & Solutions:**
1. **Incorrect API Usage**
   - Verify you're using the correct HTTP method (PUT for updates)
   - Check the API endpoint URL

2. **Response Handling Issues**
   - Check if the API returns success but actually failed:
   ```javascript
   async function updateSettings(data) {
     try {
       const response = await apiClient.put('/settings/company', data);
       
       // Check that the API actually reports success
       if (response.data.status !== 'success') {
         throw new Error(response.data.message || 'Update failed');
       }
       
       // Verify changes by refreshing data from the server
       await fetchCompanyInfo();
       
       return true;
     } catch (error) {
       console.error('Settings update failed:', error);
       return false;
     }
   }
   ```

3. **Caching Issues**
   - API responses might be cached
   - Add cache-busting parameters:
   ```javascript
   const fetchWithCacheBusting = async (url) => {
     const timestamp = new Date().getTime();
     const response = await apiClient.get(`${url}?_=${timestamp}`);
     return response;
   };
   ```

## Performance Optimization

### Problem: Slow Loading Times
**Symptoms:**
- Settings page takes a long time to load
- Multiple spinners or loading states appear

**Possible Causes & Solutions:**
1. **Serial API Calls**
   - Load settings in parallel using Promise.all:
   ```javascript
   async function loadAllSettings() {
     setLoading(true);
     
     try {
       const [companyRes, interviewRes, notificationRes] = await Promise.all([
         apiClient.get('/settings/company'),
         apiClient.get('/settings/interview-preferences'),
         apiClient.get('/settings/notification-preferences')
       ]);
       
       setCompanySettings(companyRes.data.data);
       setInterviewPrefs(interviewRes.data.data);
       setNotificationPrefs(notificationRes.data.data);
     } catch (error) {
       setError('Failed to load settings');
     } finally {
       setLoading(false);
     }
   }
   ```

2. **Implement Caching**
   - Cache settings that don't change frequently:
   ```javascript
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
   
   function getFromCache(key) {
     const cached = localStorage.getItem(key);
     if (!cached) return null;
     
     try {
       const { data, timestamp } = JSON.parse(cached);
       const now = new Date().getTime();
       
       if (now - timestamp < CACHE_DURATION) {
         return data;
       }
     } catch (e) {
       return null;
     }
     
     return null;
   }
   
   function saveToCache(key, data) {
     const cacheItem = {
       data,
       timestamp: new Date().getTime()
     };
     localStorage.setItem(key, JSON.stringify(cacheItem));
   }
   
   async function getCompanySettings() {
     // Try cache first
     const cached = getFromCache('companySettings');
     if (cached) {
       return cached;
     }
     
     // Fetch from API if not in cache
     const response = await apiClient.get('/settings/company');
     const data = response.data.data;
     
     // Save to cache
     saveToCache('companySettings', data);
     
     return data;
   }
   ```

## Debug Techniques

### API Request Debugging
1. **Enable Axios Request/Response Logging**
   ```javascript
   // Create an axios instance with logging
   const createLoggingClient = (baseURL, token) => {
     const instance = axios.create({
       baseURL,
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
       }
     });
     
     // Add request interceptor
     instance.interceptors.request.use(
       config => {
         console.log(`🔄 REQUEST: ${config.method.toUpperCase()} ${config.url}`, config);
         return config;
       },
       error => {
         console.error('❌ REQUEST ERROR:', error);
         return Promise.reject(error);
       }
     );
     
     // Add response interceptor
     instance.interceptors.response.use(
       response => {
         console.log(`✅ RESPONSE: ${response.config.method.toUpperCase()} ${response.config.url}`, response);
         return response;
       },
       error => {
         console.error(`❌ RESPONSE ERROR: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response || error);
         return Promise.reject(error);
       }
     );
     
     return instance;
   };
   ```

2. **Mock API for Testing**
   - Use MockServiceWorker or similar libraries to simulate API responses for testing:
   ```javascript
   // Example using MSW
   import { setupWorker, rest } from 'msw';

   const worker = setupWorker(
     rest.get('*/settings/company', (req, res, ctx) => {
       return res(
         ctx.status(200),
         ctx.json({
           status: 'success',
           data: {
             companyName: 'Test Company',
             website: 'https://example.com',
             industry: 'Technology',
             companySize: '11-50',
             description: 'A test company'
           }
         })
       );
     }),
     
     rest.put('*/settings/company', (req, res, ctx) => {
       return res(
         ctx.status(200),
         ctx.json({
           status: 'success',
           message: 'Company settings updated successfully'
         })
       );
     })
   );
   
   // Start the mock service worker
   worker.start();
   ```

## Conclusion

When troubleshooting API integration issues with the company settings endpoints, follow these general steps:

1. **Check Network Requests**
   - Use browser DevTools to inspect the actual request/response
   - Verify headers, payload, and response data

2. **Verify Authentication**
   - Ensure tokens are valid and properly included in requests
   - Check for token expiration and implement proper refresh logic

3. **Validate Input Data**
   - Implement client-side validation matching API requirements
   - Check for required fields, data types, and format constraints

4. **Implement Proper Error Handling**
   - Display user-friendly error messages
   - Log detailed errors for debugging

5. **Contact Support**
   - If issues persist after troubleshooting, contact Vyre API support
   - Provide request/response details, timestamps, and user information when reporting issues

By following this troubleshooting guide, you should be able to resolve most integration issues with the Vyre API company settings endpoints.
