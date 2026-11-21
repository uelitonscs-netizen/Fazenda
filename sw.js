// Fazenda Gestão — Service Worker
// Rede primeiro: sempre busca a versão nova; o cache só é usado para abrir sem internet.
var CACHE_NAME = 'fazenda-v9';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k!==CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return;
  if(new URL(req.url).origin !== self.location.origin) return; // Firebase, fontes etc. seguem direto
  e.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function(r){
      if(r && r.ok){ var c = r.clone(); caches.open(CACHE_NAME).then(function(ca){ ca.put(req, c); }); }
      return r;
    }).catch(function(){
      return caches.match(req).then(function(m){ return m || caches.match('./index.html'); });
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
