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
import { Laptop, ShieldCheck, AlertCircle, Calendar, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { key: "my-devices", label: "Thiết bị của tôi", icon: <Laptop size={18} />, path: "/my/devices" },
  { key: "my-warranties", label: "Bảo hành của tôi", icon: <ShieldCheck size={18} />, path: "/my/warranties" },
  { key: "my-tickets", label: "Ticket của tôi", icon: <AlertCircle size={18} />, path: "/my/tickets" },
  { key: "my-schedules", label: "Lịch bảo trì", icon: <Calendar size={18} />, path: "/my/schedules" },
];

const CustomerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      <aside className={cn("flex flex-col border-r bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}>
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && <span className="font-bold text-primary text-lg">EMS</span>}
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.key}
              variant={isActive(item.path) ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-2", collapsed && "justify-center px-2")}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Button>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-end px-6 border-b bg-card">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-yellow-500 text-white text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{user?.username}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleLogout} className="text-destructive gap-2">
                <LogOut size={14} /> Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CustomerLayout;
