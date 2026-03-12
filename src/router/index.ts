import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AuctionListPage from '../pages/AuctionListPage.vue'
import AuctionDetailPage from '../pages/AuctionDetailPage.vue'
import SellerStorePage from '../pages/SellerStorePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import RegisterCompletePage from '../pages/RegisterCompletePage.vue'
import MyPage from '../pages/MyPage.vue'
import ProductDetailPage from '../pages/ProductDetailPage.vue'
import CartPage from '../pages/CartPage.vue'
import CheckoutPage from '../pages/CheckoutPage.vue'
import OrderCompletePage from '../pages/OrderCompletePage.vue'
import SellerApplyPage from '../pages/SellerApplyPage.vue'
import SellerApplyCompletePage from '../pages/SellerApplyCompletePage.vue'
import SellerProfileSetupPage from '../pages/SellerProfileSetupPage.vue'
import SellerProductForm from '../pages/SellerProductForm.vue'
import SellerDashboardPage from '../pages/SellerDashboardPage.vue'
import OrderDetailPage from "../pages/OrderDetailPage.vue"
import CommunityListPage from '../pages/CommunityListPage.vue'
import CommunityDetailPage from '../pages/CommunityDetailPage.vue'
import ShopPage from '../pages/ShopPage.vue'
import SellerListPage from '../pages/SellerListPage.vue'
import SellerAuctionForm from '../pages/SellerAuctionForm.vue'
import CommunityWritePage from '../pages/CommunityWritePage.vue'
import AdminPage from '../pages/AdminPage.vue'
import ServerErrorPage from '../pages/ServerErrorPage.vue'
import WithdrawCompletePage from '../pages/WithdrawCompletePage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/login', name: 'Login', component: LoginPage, meta: { requiresGuest: true } },
  { path: '/register', name: 'Register', component: RegisterPage, meta: { requiresGuest: true } },
  { path: '/register/complete', name: 'RegisterComplete', component: RegisterCompletePage },
  { path: '/search', redirect: (to) => ({ path: '/shop', query: to.query }) },
  { path: '/products/:productId', name: 'ProductDetail', component: ProductDetailPage },
  { path: '/auction', name: 'AuctionList', component: AuctionListPage },
  { path: '/auction/:auctionId', name: 'AuctionDetail', component: AuctionDetailPage },
  { path: '/store/:sellerId', name: 'SellerStore', component: SellerStorePage },
  { path: '/community', name: 'CommunityList', component: CommunityListPage },
  { path: '/community/write', name: 'CommunityWrite', component: CommunityWritePage },
  { path: '/community/:postId', name: 'CommunityDetail', component: CommunityDetailPage },
  { path: '/community/:postId/edit', name: 'CommunityEdit', component: CommunityWritePage },
  { path: '/shop', name: 'Shop', component: ShopPage },
  { path: '/stores', name: 'SellerList', component: SellerListPage },
  { path: '/error', name: 'ServerError', component: ServerErrorPage },
  { path: '/withdraw/complete', name: 'WithdrawComplete', component: WithdrawCompletePage },

  // 로그인 필요
  { path: '/mypage', name: 'MyPage', component: MyPage, meta: { requiresAuth: true } },
  { path: '/mypage/seller', name: 'SellerDashboard', component: SellerDashboardPage, meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: CartPage, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: CheckoutPage, meta: { requiresAuth: true } },
  { path: '/orders/complete', name: 'OrderComplete', component: OrderCompletePage, meta: { requiresAuth: true } },
  { path: '/orders/:orderId', name: 'OrderDetail', component: OrderDetailPage, meta: { requiresAuth: true } },
  { path: '/seller/apply', name: 'SellerApply', component: SellerApplyPage, meta: { requiresAuth: true } },
  { path: '/seller/apply/complete', name: 'SellerApplyComplete', component: SellerApplyCompletePage, meta: { requiresAuth: true } },
  { path: '/seller/profile/setup', name: 'SellerProfileSetup', component: SellerProfileSetupPage, meta: { requiresAuth: true } },
  { path: '/seller/profile/edit', name: 'SellerProfileEdit', component: SellerProfileSetupPage, meta: { requiresAuth: true } },
  { path: '/seller/products/new', name: 'SellerProductNew', component: SellerProductForm, meta: { requiresAuth: true } },
  { path: '/seller/products/:id/edit', name: 'SellerProductEdit', component: SellerProductForm, meta: { requiresAuth: true } },
  { path: '/seller/auctions/new', name: 'SellerAuctionNew', component: SellerAuctionForm, meta: { requiresAuth: true } },
  { path: '/admin', name: 'Admin', component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
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

  // 관리자가 마이페이지 접근 시 관리자 센터로 리다이렉트
  if (to.name === 'MyPage' && authStore.isAdmin) {
    return { name: 'Admin' }
  }

  return true
})

export default router
