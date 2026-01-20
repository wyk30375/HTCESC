// Service Worker for PWA
const CACHE_NAME = 'used-car-management-v3-20260120-1355'; // 再次更新版本号强制刷新
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装事件 - 立即激活
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ 缓存已添加');
        // 立即激活，不等待
        return self.skipWaiting();
      })
  );
});

// 激活事件 - 清除所有旧缓存
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除所有旧缓存，包括不同版本的
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ 所有旧缓存已清除');
      // 立即接管所有页面
      return self.clients.claim();
    })
  );
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 只缓存GET请求
  if (event.request.method !== 'GET') {
    return;
  }

  // 跳过Supabase API请求
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  // 跳过 Vite 的开发服务器文件和 chunk 文件（使用网络优先）
  if (event.request.url.includes('node_modules/.vite') || 
      event.request.url.includes('.vite') ||
      event.request.url.includes('/@') ||
      event.request.url.match(/\.(js|css|ts|tsx|jsx)\?v=/)) {
    // 网络优先策略：总是从网络获取最新版本
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 其他资源使用缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 缓存命中，返回缓存
        if (response) {
          return response;
        }

        // 克隆请求
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // 检查是否是有效响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // 克隆响应
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});

// 推送通知
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : '您有新的消息',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('二手车管理系统', options)
  );
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
