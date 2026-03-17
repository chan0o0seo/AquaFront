importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyD9yNbLP0ZfNOr_anTEtnknQsVrWhNw2kc',
  authDomain: 'aquahun-50a1e.firebaseapp.com',
  projectId: 'aquahun-50a1e',
  storageBucket: 'aquahun-50a1e.firebasestorage.app',
  messagingSenderId: '675506532606',
  appId: '1:675506532606:web:29eb8a9232ad886f34b5af',
})

const messaging = firebase.messaging()

// 백그라운드 푸시 수신 처리
messaging.onBackgroundMessage((payload) => {
  const { title, body, image } = payload.notification ?? {}

  self.registration.showNotification(title ?? 'AquaHub', {
    body: body ?? '',
    icon: '/favicon.ico',
    image: image,
    badge: '/favicon.ico',
    data: payload.data,
  })
})

// 알림 클릭 시 앱으로 포커스
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus()
      }
      return clients.openWindow('/')
    })
  )
})
