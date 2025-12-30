import { authService } from "@/services/auth";
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: false },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/products",
      name: "products",
      component: () => import("../views/ProductsView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/categories",
      name: "categories",
      component: () => import("../views/CategoriesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/suppliers",
      name: "suppliers",
      component: () => import("../views/SuppliersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/warehouses",
      name: "warehouses",
      component: () => import("../views/WarehousesView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/stock",
      name: "stock",
      component: () => import("../views/StockView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/users",
      name: "users",
      component: () => import("../views/UsersView.vue"),
      meta: { requiresAuth: true },
    },
  ],
});

// Middleware de autenticação
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();

  // Se o token estiver expirado, redireciona para login
  if (authService.isTokenExpired()) {
    authService.logout();
    if (to.meta.requiresAuth) {
      next("/");
      return;
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/");
  } else if ((to.path === "/" || to.path === "/register") && isAuthenticated) {
    next("/dashboard");
  } else {
    next();
  }
});

export default router;
