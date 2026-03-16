import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ── 공개 페이지 ──────────────────────────────────────
  { path: '/',                   name: 'Home',               component: () => import('@/pages/HomePage.vue') },
  { path: '/login',              name: 'Login',              component: () => import('@/pages/LoginPage.vue'),              meta: { requiresGuest: true } },
  { path: '/register',           name: 'Register',           component: () => import('@/pages/RegisterPage.vue'),           meta: { requiresGuest: true } },
  { path: '/register/complete',  name: 'RegisterComplete',   component: () => import('@/pages/RegisterCompletePage.vue') },
  { path: '/register/social',    name: 'RegisterSocial',     component: () => import('@/pages/RegisterSocialPage.vue') },
  { path: '/search',             redirect: (to: any) => ({ path: '/shop', query: to.query }) },
  { path: '/shop',               name: 'Shop',               component: () => import('@/pages/ShopPage.vue') },
  { path: '/products/:productId',name: 'ProductDetail',      component: () => import('@/pages/ProductDetailPage.vue') },
  { path: '/auction',            name: 'AuctionList',        component: () => import('@/pages/AuctionListPage.vue') },
  { path: '/auction/:auctionId', name: 'AuctionDetail',      component: () => import('@/pages/AuctionDetailPage.vue') },
  { path: '/store/:sellerId',    name: 'SellerStore',        component: () => import('@/pages/SellerStorePage.vue') },
  { path: '/stores',             name: 'SellerList',         component: () => import('@/pages/SellerListPage.vue') },
  { path: '/community',          name: 'CommunityList',      component: () => import('@/pages/CommunityListPage.vue') },
  { path: '/community/write',    name: 'CommunityWrite',     component: () => import('@/pages/CommunityWritePage.vue') },
  { path: '/community/:postId',  name: 'CommunityDetail',    component: () => import('@/pages/CommunityDetailPage.vue') },
  { path: '/community/:postId/edit', name: 'CommunityEdit', component: () => import('@/pages/CommunityWritePage.vue') },
  { path: '/error',              name: 'ServerError',        component: () => import('@/pages/ServerErrorPage.vue') },
  { path: '/oauth2/callback',    name: 'OAuth2Callback',     component: () => import('@/pages/OAuth2CallbackPage.vue') },
  { path: '/withdraw/complete',  name: 'WithdrawComplete',   component: () => import('@/pages/WithdrawCompletePage.vue') },

  // ── 로그인 필요 ───────────────────────────────────────
  { path: '/mypage',             name: 'MyPage',             component: () => import('@/pages/MyPage.vue'),                 meta: { requiresAuth: true } },
  { path: '/mypage/seller',      name: 'SellerDashboard',    component: () => import('@/pages/SellerDashboardPage.vue'),    meta: { requiresAuth: true } },
  { path: '/cart',               name: 'Cart',               component: () => import('@/pages/CartPage.vue'),               meta: { requiresAuth: true } },
  { path: '/checkout',           name: 'Checkout',           component: () => import('@/pages/CheckoutPage.vue'),           meta: { requiresAuth: true } },
  { path: '/orders/complete',    name: 'OrderComplete',      component: () => import('@/pages/OrderCompletePage.vue'),      meta: { requiresAuth: true } },
  { path: '/orders/:orderId',    name: 'OrderDetail',        component: () => import('@/pages/OrderDetailPage.vue'),        meta: { requiresAuth: true } },
  { path: '/seller/apply',       name: 'SellerApply',        component: () => import('@/pages/SellerApplyPage.vue'),        meta: { requiresAuth: true } },
  { path: '/seller/apply/complete', name: 'SellerApplyComplete', component: () => import('@/pages/SellerApplyCompletePage.vue'), meta: { requiresAuth: true } },
  { path: '/seller/profile/setup', name: 'SellerProfileSetup', component: () => import('@/pages/SellerProfileSetupPage.vue'), meta: { requiresAuth: true } },
  { path: '/seller/profile/edit',  name: 'SellerProfileEdit',  component: () => import('@/pages/SellerProfileSetupPage.vue'), meta: { requiresAuth: true } },
  // editor 청크: Tiptap이 포함된 페이지들 (webpackChunkName 대신 Vite는 주석 힌트)
  { path: '/seller/products/new',  name: 'SellerProductNew',  component: () => import(/* @vite-ignore */ '@/pages/SellerProductForm.vue'),  meta: { requiresAuth: true } },
  { path: '/seller/products/:id/edit', name: 'SellerProductEdit', component: () => import(/* @vite-ignore */ '@/pages/SellerProductForm.vue'), meta: { requiresAuth: true } },
  { path: '/seller/auctions/new', name: 'SellerAuctionNew',  component: () => import(/* @vite-ignore */ '@/pages/SellerAuctionForm.vue'),  meta: { requiresAuth: true } },
  { path: '/admin',              name: 'Admin',              component: () => import('@/pages/AdminPage.vue'),              meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*',    redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// 인증 가드
router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth')
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchMe()
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return { name: 'Home' }
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return { name: 'Home' }
  }
  if (to.name === 'MyPage' && authStore.isAdmin) {
    return { name: 'Admin' }
  }

  return true
})

export default router
