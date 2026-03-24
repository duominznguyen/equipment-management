import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "@/components/PrivateRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import TechnicianLayout from "@/components/layout/TechnicianLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UserListPage from "@/pages/users/UserListPage";
import CustomerListPage from "@/pages/customers/CustomerListPage";
import { useAuthStore } from "@/stores/auth.store";

const RootRedirect = () => {
  const { token, user, isLoading } = useAuthStore();
  if (isLoading) return null;
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/dashboard" replace />;
  if (user?.role === "technician") return <Navigate to="/tech" replace />;
  return <Navigate to="/my" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Root redirect
  {
    path: "/",
    element: <RootRedirect />,
  },

  // Admin routes
  {
    element: (
      <PrivateRoute roles={["admin"]}>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { path: "users", element: <UserListPage /> },
      { path: "customers", element: <CustomerListPage /> },
      // Các route admin khác sẽ thêm vào đây
    ],
  },

  // Technician routes
  {
    path: "/tech",
    element: (
      <PrivateRoute roles={["technician"]}>
        <TechnicianLayout />
      </PrivateRoute>
    ),
    children: [
      // Trang mặc định khi vào /tech
      { index: true, element: <div className="p-4">Chào mừng Kỹ thuật viên!</div> },
      // Các route tech khác sẽ thêm vào đây
    ],
  },

  // Customer routes
  {
    path: "/my",
    element: (
      <PrivateRoute roles={["customer"]}>
        <CustomerLayout />
      </PrivateRoute>
    ),
    children: [
      // Trang mặc định khi vào /my
      { index: true, element: <div className="p-4">Chào mừng Khách hàng!</div> },
      // Các route customer khác sẽ thêm vào đây
    ],
  },

  {
    path: "/403",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-destructive">403</h1>
          <p className="text-muted-foreground mt-2">Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    ),
  },
]);

export default router;
