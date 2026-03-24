import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";

interface Props {
  children: React.ReactNode;
  roles?: string[];
}

const PrivateRoute = ({ children, roles }: Props) => {
  const { token, user, isLoading } = useAuthStore();

  // Chờ persist load xong mới check
  if (isLoading) return null;

  if (!token) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
