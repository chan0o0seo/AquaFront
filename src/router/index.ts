import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // ── 공개 페이지 ──────────────────────────────────────
  { path: '/',                   name: 'Home',               component: () => import('@/pages/HomePage.vue'),               meta: { title: '아쿠아 Hub' } },
  { path: '/login',              name: 'Login',              component: () => import('@/pages/LoginPage.vue'),              meta: { title: '로그인', requiresGuest: true } },
  { path: '/register',           name: 'Register',           component: () => import('@/pages/RegisterPage.vue'),           meta: { title: '회원가입', requiresGuest: true } },
  { path: '/register/complete',  name: 'RegisterComplete',   component: () => import('@/pages/RegisterCompletePage.vue'),   meta: { title: '회원가입 완료' } },
  { path: '/register/social',    name: 'RegisterSocial',     component: () => import('@/pages/RegisterSocialPage.vue'),     meta: { title: '소셜 회원가입' } },
  { path: '/search',             redirect: (to: any) => ({ path: '/shop', query: to.query }) },
  { path: '/shop',               name: 'Shop',               component: () => import('@/pages/ShopPage.vue'),               meta: { title: '상품 검색' } },
  { path: '/products/:productId',name: 'ProductDetail',      component: () => import('@/pages/ProductDetailPage.vue'),      meta: { title: '상품 상세' } },
  { path: '/auction',            name: 'AuctionList',        component: () => import('@/pages/AuctionListPage.vue'),        meta: { title: '경매' } },
  { path: '/auction/:auctionId', name: 'AuctionDetail',      component: () => import('@/pages/AuctionDetailPage.vue'),      meta: { title: '경매 상세' } },
  { path: '/store/:sellerId',    name: 'SellerStore',        component: () => import('@/pages/SellerStorePage.vue'),        meta: { title: '스토어' } },
  { path: '/stores',             name: 'SellerList',         component: () => import('@/pages/SellerListPage.vue'),         meta: { title: '스토어 목록' } },
  { path: '/community',          name: 'CommunityList',      component: () => import('@/pages/CommunityListPage.vue'),      meta: { title: '커뮤니티' } },
  { path: '/community/write',    name: 'CommunityWrite',     component: () => import('@/pages/CommunityWritePage.vue'),     meta: { title: '글 작성' } },
  { path: '/community/:postId',  name: 'CommunityDetail',    component: () => import('@/pages/CommunityDetailPage.vue'),    meta: { title: '커뮤니티' } },
  { path: '/community/:postId/edit', name: 'CommunityEdit', component: () => import('@/pages/CommunityWritePage.vue'),     meta: { title: '글 수정' } },
  { path: '/error',              name: 'ServerError',        component: () => import('@/pages/ServerErrorPage.vue'),        meta: { title: '오류' } },
  { path: '/oauth2/callback',    name: 'OAuth2Callback',     component: () => import('@/pages/OAuth2CallbackPage.vue') },
  { path: '/withdraw/complete',  name: 'WithdrawComplete',   component: () => import('@/pages/WithdrawCompletePage.vue'),   meta: { title: '탈퇴 완료' } },

  // ── 로그인 필요 ───────────────────────────────────────
  { path: '/mypage',             name: 'MyPage',             component: () => import('@/pages/MyPage.vue'),                 meta: { title: '마이페이지', requiresAuth: true } },
  { path: '/mypage/seller',      name: 'SellerDashboard',    component: () => import('@/pages/SellerDashboardPage.vue'),    meta: { title: '판매자 센터', requiresAuth: true } },
  { path: '/cart',               name: 'Cart',               component: () => import('@/pages/CartPage.vue'),               meta: { title: '장바구니', requiresAuth: true } },
  { path: '/checkout',           name: 'Checkout',           component: () => import('@/pages/CheckoutPage.vue'),           meta: { title: '주문/결제', requiresAuth: true } },
  { path: '/orders/complete',    name: 'OrderComplete',      component: () => import('@/pages/OrderCompletePage.vue'),      meta: { title: '주문 완료', requiresAuth: true } },
  { path: '/orders/:orderId',    name: 'OrderDetail',        component: () => import('@/pages/OrderDetailPage.vue'),        meta: { title: '주문 상세', requiresAuth: true } },
  { path: '/seller/apply',       name: 'SellerApply',        component: () => import('@/pages/SellerApplyPage.vue'),        meta: { title: '판매자 신청', requiresAuth: true } },
  { path: '/seller/apply/complete', name: 'SellerApplyComplete', component: () => import('@/pages/SellerApplyCompletePage.vue'), meta: { title: '신청 완료', requiresAuth: true } },
  { path: '/seller/profile/setup', name: 'SellerProfileSetup', component: () => import('@/pages/SellerProfileSetupPage.vue'), meta: { title: '프로필 설정', requiresAuth: true } },
  { path: '/seller/profile/edit',  name: 'SellerProfileEdit',  component: () => import('@/pages/SellerProfileSetupPage.vue'), meta: { title: '프로필 수정', requiresAuth: true } },
  { path: '/seller/products/new',  name: 'SellerProductNew',  component: () => import(/* @vite-ignore */ '@/pages/SellerProductForm.vue'),  meta: { title: '상품 등록', requiresAuth: true } },
  { path: '/seller/products/:id/edit', name: 'SellerProductEdit', component: () => import(/* @vite-ignore */ '@/pages/SellerProductForm.vue'), meta: { title: '상품 수정', requiresAuth: true } },
  { path: '/seller/auctions/new', name: 'SellerAuctionNew',  component: () => import(/* @vite-ignore */ '@/pages/SellerAuctionForm.vue'),  meta: { title: '경매 등록', requiresAuth: true } },
  { path: '/admin',              name: 'Admin',              component: () => import('@/pages/AdminPage.vue'),              meta: { title: '관리자', requiresAuth: true, requiresAdmin: true } },
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
    // 로그인 후 원래 페이지로 복원
    return { name: 'Login', query: { redirect: to.fullPath } }
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

// 페이지 타이틀
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | 아쿠아 Hub` : '아쿠아 Hub'
})

export default router
