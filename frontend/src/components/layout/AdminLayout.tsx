import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Wrench,
  // FileText,
  AlertCircle,
  Calendar,
  Package,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Laptop,
  // PackagePlus,
  // PackageMinus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: { key: string; label: string; path: string }[];
}

const menuItems: MenuItem[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} />, path: "/dashboard" },
  {
    key: "users",
    label: "Người dùng",
    icon: <Users size={18} />,
    children: [
      { key: "customers", label: "Khách hàng", path: "/customers" },
      { key: "technicians", label: "Kỹ thuật viên", path: "/technicians" },
      { key: "users", label: "Tài khoản", path: "/users" },
    ],
  },
  { key: "devices", label: "Thiết bị", icon: <Laptop size={18} />, path: "/devices" },
  { key: "device-categories", label: "Loại thiết bị", icon: <Package size={18} />, path: "/device-categories" },
  { key: "warranty-contracts", label: "Hợp đồng BH", icon: <ShieldCheck size={18} />, path: "/warranty-contracts" },
  { key: "tickets", label: "Ticket sự cố", icon: <AlertCircle size={18} />, path: "/tickets" },
  { key: "maintenance-requests", label: "Phiếu bảo trì", icon: <Wrench size={18} />, path: "/maintenance-requests" },
  { key: "maintenance-schedules", label: "Lịch bảo trì", icon: <Calendar size={18} />, path: "/maintenance-schedules" },
  {
    key: "warehouse",
    label: "Kho linh kiện",
    icon: <Package size={18} />,
    children: [
      { key: "parts", label: "Danh mục linh kiện", path: "/parts" },
      { key: "part-imports", label: "Nhập kho", path: "/part-imports" },
      { key: "part-exports", label: "Xuất kho", path: "/part-exports" },
    ],
  },
  { key: "reports", label: "Báo cáo", icon: <BarChart3 size={18} />, path: "/reports" },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["users", "warehouse"]);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = (key: string) => {
    setOpenMenus((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn("flex flex-col border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && <span className="font-bold text-primary text-lg">EMS</span>}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {menuItems.map((item) => (
            <div key={item.key}>
              {item.children ? (
                <>
                  <Button
                    variant="ghost"
                    className={cn("w-full justify-start gap-2", collapsed && "justify-center px-2")}
                    onClick={() => !collapsed && toggleMenu(item.key)}
                  >
                    {item.icon}
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {openMenus.includes(item.key) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </>
                    )}
                  </Button>
                  {!collapsed && openMenus.includes(item.key) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Button
                          key={child.key}
                          variant={isActive(child.path) ? "secondary" : "ghost"}
                          className="w-full justify-start text-sm"
                          onClick={() => navigate(child.path)}
                        >
                          {child.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Button
                  variant={isActive(item.path!) ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-2", collapsed && "justify-center px-2")}
                  onClick={() => navigate(item.path!)}
                >
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-end px-6 border-b bg-card">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2">
                <LogOut size={14} />
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
