import { initializeApp } from 'firebase/app'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: 'AIzaSyD9yNbLP0ZfNOr_anTEtnknQsVrWhNw2kc',
  authDomain: 'aquahun-50a1e.firebaseapp.com',
  projectId: 'aquahun-50a1e',
  storageBucket: 'aquahun-50a1e.firebasestorage.app',
  messagingSenderId: '675506532606',
  appId: '1:675506532606:web:29eb8a9232ad886f34b5af',
  measurementId: 'G-9SBEXK1NXF',
}

export const VAPID_KEY = 'BC9GMbjGUththsKIfEbFrObOFSDeraL01jNX9gZPsFXrwwQB41-0FxXG2JvGrAHo8Tig5zJb1x7gf-G_HM_i8xA'

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)
