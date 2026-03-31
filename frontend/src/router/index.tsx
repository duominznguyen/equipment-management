import { createBrowserRouter, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import PrivateRoute from "@/components/PrivateRoute";
import AdminLayout from "@/components/layout/AdminLayout";
import TechnicianLayout from "@/components/layout/TechnicianLayout";
import CustomerLayout from "@/components/layout/CustomerLayout";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/dashboard/DashboardPage";
import UserListPage from "@/pages/users/UserListPage";
import CustomerListPage from "@/pages/customers/CustomerListPage";
import TechnicianListPage from "@/pages/technicians/TechnicianListPage";
import DeviceCategoryListPage from "@/pages/device-categories/DeviceCategoryListPage";
import DeviceListPage from "@/pages/devices/DeviceListPage";

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
      { path: "technicians", element: <TechnicianListPage /> },
      { path: "device-categories", element: <DeviceCategoryListPage /> },
      { path: "devices", element: <DeviceListPage /> },
      // Các child route admin khác
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
      // Các child route tech khác
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
      // Các child route customer khác
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
