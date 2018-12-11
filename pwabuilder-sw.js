

(function() {
  'use strict';

  var filesToCache = [
    'offline.html'
  ];
  

var dynamicCacheName = 'pages-cache-v1';
self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install', e);


    e.waitUntil(
        caches.open(dynamicCacheName)
      .then(function(cache) {
        return cache.addAll(filesToCache);
      }) 
    ); 
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate', e);
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== dynamicCacheName) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    ); 
    return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
	// Don't listen POST method 
    if (event.request.method == 'POST') return;

    var requestUrl = new URL(event.request.url);
    if(requestUrl.pathname == './pwabuilder-sw.js') return;

    event.respondWith(
        caches.match(event.request).then(function(resp) {
            return fetch(event.request).then(function(response) {
            	//Add page 404 here
                return caches.open(dynamicCacheName).then(function(cache) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        }).catch(function(error) {
			 console.log('Service worker registration failed, error:', error);
			return caches.match('offline.html');
        })
    );
});

})();