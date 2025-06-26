/**
 * Script to list all API endpoints in the Vyre API
 * Run with: npm run api:endpoints
 */

const fs = require('fs');
const path = require('path');
const express = require('express');

// Create a temporary Express app to register routes
const app = express();

// Import routes
try {
  // This assumes routes are organized in a structure like:
  // src/routes/userRoutes.js, src/routes/settingsRoutes.js, etc.
  const routesDir = path.join(__dirname, '../src/routes');
  
  if (fs.existsSync(routesDir)) {
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('Routes.js'));
    
    console.log('\n=== VYRE API ENDPOINTS ===\n');
    
    // Process each route file
    routeFiles.forEach(file => {
      try {
        const routeName = file.replace('Routes.js', '').toLowerCase();
        const fullPath = path.join(routesDir, file);
        
        // Create a router just for this file to collect its routes
        const router = express.Router();
        
        // Mock the Express router methods to capture routes
        const originalGet = router.get;
        const originalPost = router.post;
        const originalPut = router.put;
        const originalPatch = router.patch;
        const originalDelete = router.delete;
        
        const routes = [];
        
        // Override router methods to capture endpoints
        router.get = function(path, ...handlers) {
          routes.push({ method: 'GET', path });
          return originalGet.apply(this, [path, ...handlers]);
        };
        
        router.post = function(path, ...handlers) {
          routes.push({ method: 'POST', path });
          return originalPost.apply(this, [path, ...handlers]);
        };
        
        router.put = function(path, ...handlers) {
          routes.push({ method: 'PUT', path });
          return originalPut.apply(this, [path, ...handlers]);
        };
        
        router.patch = function(path, ...handlers) {
          routes.push({ method: 'PATCH', path });
          return originalPatch.apply(this, [path, ...handlers]);
        };
        
        router.delete = function(path, ...handlers) {
          routes.push({ method: 'DELETE', path });
          return originalDelete.apply(this, [path, ...handlers]);
        };
        
        // Temporarily redirect console logs
        const originalConsoleLog = console.log;
        console.log = () => {};
        
        // Try to require the route file
        try {
          require(fullPath)(router);
        } catch (err) {
          // Restore console.log before showing error
          console.log = originalConsoleLog;
          console.error(`Error loading routes from ${file}: ${err.message}`);
        }
        
        // Restore console.log
        console.log = originalConsoleLog;
        
        // Output the captured routes
        if (routes.length > 0) {
          console.log(`\n${routeName.toUpperCase()} ENDPOINTS:`);
          routes.forEach(route => {
            console.log(`${route.method.padEnd(6)} /api/${routeName}${route.path}`);
          });
        }
      } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
      }
    });
    
    console.log('\n=== COMPANY SETTINGS ENDPOINTS ===\n');
    console.log('GET    /api/settings/company');
    console.log('PUT    /api/settings/company');
    console.log('GET    /api/settings/interview-preferences');
    console.log('PUT    /api/settings/interview-preferences');
    console.log('GET    /api/settings/notification-preferences');
    console.log('PUT    /api/settings/notification-preferences');
    
    console.log('\n');
  } else {
    console.error(`Routes directory not found: ${routesDir}`);
    console.log('\nFallback to API specification...\n');
    console.log('=== COMPANY SETTINGS ENDPOINTS ===\n');
    console.log('GET    /api/settings/company');
    console.log('PUT    /api/settings/company');
    console.log('GET    /api/settings/interview-preferences');
    console.log('PUT    /api/settings/interview-preferences');
    console.log('GET    /api/settings/notification-preferences');
    console.log('PUT    /api/settings/notification-preferences');
  }
} catch (err) {
  console.error(`Error processing routes: ${err.message}`);
  console.log('\nFallback to API specification...\n');
  console.log('=== COMPANY SETTINGS ENDPOINTS ===\n');
  console.log('GET    /api/settings/company');
  console.log('PUT    /api/settings/company');
  console.log('GET    /api/settings/interview-preferences');
  console.log('PUT    /api/settings/interview-preferences');
  console.log('GET    /api/settings/notification-preferences');
  console.log('PUT    /api/settings/notification-preferences');
}
