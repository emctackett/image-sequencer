const request = new XMLHttpRequest();
request.open("GET", "../manifest.json", false);
request.send(null);
const meta = JSON.parse(request.responseText).metadata,
      ver = meta.version,
      betaVer = meta.betaVersion;
const version = (window.location.indexOf('beta') == 0) ? betaVer : ver;
 
const staticCacheName = `image-sequencer-static-v${version}`;

self.addEventListener('install', event => {
  console.log('Attempting to install service worker');
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName.startsWith('image-sequencer-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName){
          return caches.delete(cacheName);
        })
      );
    })
  );      
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          if(event.request.method == "GET")
            cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});
