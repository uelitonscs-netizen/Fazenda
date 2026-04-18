// Fazenda Gestão — Service Worker
var CACHE_NAME = 'fazenda-v8';
var urlsToCache = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  e.respondWith(
    caches.match(e.request).then(function(response){
      return response || fetch(e.request);
    })
  );
});

// Handle push notifications
self.addEventListener('push', function(e){
  var data = {};
  try { data = e.data.json(); } catch(err) { data = { title: 'Fazenda Gestão', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'Fazenda Gestão', {
      body: data.body || '',
      icon: '/Fazenda/icon-192.png',
      badge: '/Fazenda/icon-192.png',
      vibrate: [200, 100, 200],
      data: data
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', function(e){
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList){
      for(var i=0; i<clientList.length; i++){
        if(clientList[i].url && 'focus' in clientList[i]) return clientList[i].focus();
      }
      if(clients.openWindow) return clients.openWindow('/Fazenda/');
    })
  );
});
