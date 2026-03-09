import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AuctionListPage from '../pages/AuctionListPage.vue'
import AuctionDetailPage from '../pages/AuctionDetailPage.vue'
import SellerStorePage from '../pages/SellerStorePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'
import RegisterCompletePage from '../pages/RegisterCompletePage.vue'
import MyPage from '../pages/MyPage.vue'
import SearchPage from '../pages/SearchPage.vue'
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
import SellerAuctionForm from '../pages/SellerAuctionForm.vue'
import CommunityWritePage from '../pages/CommunityWritePage.vue'
import AdminPage from '../pages/AdminPage.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  },
  {
    path: '/register/complete',
    name: 'RegisterComplete',
    component: RegisterCompletePage
  },
  {
    path: '/mypage',
    name: 'MyPage',
    component: MyPage
  },
  {
    path: '/search',
    name: 'Search',
    component: SearchPage
  },
  {
    path: '/products/:productId',
    name: 'ProductDetail',
    component: ProductDetailPage
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartPage
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutPage
  },
  {
    path: '/orders/complete',
    name: 'OrderComplete',
    component: OrderCompletePage
  },
  {
    path: '/mypage/seller',
    name: 'SellerDashboard',
    component: SellerDashboardPage
  },
  {
    path: '/seller/apply',
    name: 'SellerApply',
    component: SellerApplyPage
  },
  {
    path: '/seller/apply/complete',
    name: 'SellerApplyComplete',
    component: SellerApplyCompletePage
  },
  {
    path: '/seller/profile/setup',
    name: 'SellerProfileSetup',
    component: SellerProfileSetupPage
  },
  {
    path: '/seller/profile/edit',
    name: 'SellerProfileEdit',
    component: SellerProfileSetupPage
  },
  {
    path: '/seller/products/new',
    name: 'SellerProductNew',
    component: SellerProductForm
  },
  {
    path: '/seller/products/:id/edit',
    name: 'SellerProductEdit',
    component: SellerProductForm
  },
  {
    path: '/orders/:orderId',
    name: 'OrderDetail',
    component: OrderDetailPage
  },
  {
    path: '/auction',
    name: 'AuctionList',
    component: AuctionListPage
  },
  {
    path: '/auction/:auctionId',
    name: 'AuctionDetail',
    component: AuctionDetailPage
  },
  {
    path: '/store/:sellerId',
    name: 'SellerStore',
    component: SellerStorePage
  },
  {
    path: '/community',
    name: 'CommunityList',
    component: CommunityListPage
  },
  {
    path: '/community/:postId',
    name: 'CommunityDetail',
    component: CommunityDetailPage
  },
  {
    path: '/shop',
    name: 'Shop',
    component: ShopPage
  },
  {
    path: '/seller/auctions/new',
    name: 'SellerAuctionNew',
    component: SellerAuctionForm
  },
  {
    path: '/community/write',
    name: 'CommunityWrite',
    component: CommunityWritePage
  },
  {
    path: '/community/:postId/edit',
    name: 'CommunityEdit',
    component: CommunityWritePage
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
