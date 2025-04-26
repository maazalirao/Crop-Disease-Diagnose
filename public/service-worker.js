/**
 * Crop Disease Diagnosis - Service Worker
 * 
 * This service worker provides offline capabilities and caching for the app.
 */

const CACHE_NAME = 'crop-disease-v1';

// Resources to cache on install
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  // CSS files
  '/_next/static/css/app.css',
  // Core app files
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/app.js',
  // Add paths to pre-cache here
];

// Model files to cache (if available)
const MODEL_CACHE_URLS = [
  '/models/tf.min.js',
  '/models/mobilenet.min.js',
  '/models/model.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('[Service Worker] Caching static resources');
          return cache.addAll(STATIC_CACHE_URLS)
            .catch(error => console.error('[Service Worker] Error caching static resources:', error));
        }),
      
      // Try to cache model files (if they exist)
      caches.open(CACHE_NAME + '-models')
        .then((cache) => {
          console.log('[Service Worker] Attempting to cache model files');
          return Promise.allSettled(
            MODEL_CACHE_URLS.map(url => 
              fetch(url)
                .then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                  console.log(`[Service Worker] Model file not available: ${url}`);
                })
                .catch(() => console.log(`[Service Worker] Model file not available: ${url}`))
            )
          );
        })
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  // Claim clients to control all open tabs
  event.waitUntil(clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== CACHE_NAME + '-models' && key !== CACHE_NAME + '-images') {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Fetch event - serve from cache if available
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and browser extensions
  if (event.request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip Supabase API calls and other external resources
  if (url.hostname.includes('supabase.co') || 
      url.hostname.includes('googleapis.com') ||
      url.pathname.includes('/api/')) {
    return;
  }
  
  // Skip analytics and tracking
  if (url.hostname.includes('analytics') || 
      url.pathname.includes('tracking') ||
      url.pathname.includes('gtm') ||
      url.pathname.includes('ga')) {
    return;
  }
  
  // Handle model files with a network-first strategy (they might be updated)
  if (url.pathname.includes('/models/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the response for next time
          const responseClone = response.clone();
          caches.open(CACHE_NAME + '-models').then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For most resources, use a cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise try the network
        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a success response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            // Cache the response for future
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);
            
            // For HTML navigation, show an offline page
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/offline.html')
                .catch(() => {
                  // If no offline page exists, return a simple message
                  return new Response(
                    '<html><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
                    { 
                      headers: { 'Content-Type': 'text/html' }
                    }
                  );
                });
            }
            
            // Let the error propagate for other resources
            throw error;
          });
      })
  );
});

// Handle background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-diagnoses') {
    event.waitUntil(syncDiagnoses());
  }
});

// Sync diagnoses data when online
async function syncDiagnoses() {
  const offlineData = await getOfflineData();
  
  if (!offlineData || !offlineData.length) {
    return;
  }
  
  // Try to send each pending diagnosis
  const results = await Promise.allSettled(
    offlineData.map(async (data) => {
      try {
        const response = await fetch('/api/diagnoses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Remove from offline storage if successful
          return removeOfflineData(data.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync failed for diagnosis:', data.id, error);
      }
    })
  );
  
  return results;
}

// Get offline data from IndexedDB
async function getOfflineData() {
  // This is a placeholder - in a real app you'd implement IndexedDB access
  return [];
}

// Remove offline data after successful sync
async function removeOfflineData(id) {
  // This is a placeholder - in a real app you'd implement IndexedDB access
  return true;
} 