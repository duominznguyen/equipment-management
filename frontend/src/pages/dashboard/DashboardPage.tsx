import { useQuery } from "@tanstack/react-query";
import { getOverview } from "@/services/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Laptop, Users, FileText, AlertCircle, ShieldCheck, Package, Wrench, TrendingUp } from "lucide-react";

const StatCard = ({
  title,
  value,
  icon,
  description,
  variant = "default",
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  variant?: "default" | "warning" | "danger" | "success";
}) => {
  const variantStyles = {
    default: "text-primary",
    warning: "text-yellow-500",
    danger: "text-destructive",
    success: "text-green-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={variantStyles[variant]}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["overview"],
    queryFn: getOverview,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Thiết bị */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Thiết bị</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Tổng thiết bị" value={data?.devices?.total || 0} icon={<Laptop size={20} />} />
          <StatCard
            title="Đang hoạt động"
            value={data?.devices?.active || 0}
            icon={<Laptop size={20} />}
            variant="success"
          />
          <StatCard
            title="Đang bảo trì"
            value={data?.devices?.maintaining || 0}
            icon={<Wrench size={20} />}
            variant="warning"
          />
          <StatCard title="Hỏng" value={data?.devices?.broken || 0} icon={<Laptop size={20} />} variant="danger" />
        </div>
      </div>

      {/* Người dùng */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Người dùng</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard title="Khách hàng" value={data?.people?.customers || 0} icon={<Users size={20} />} />
          <StatCard title="Kỹ thuật viên" value={data?.people?.technicians || 0} icon={<Users size={20} />} />
        </div>
      </div>

      {/* Tickets */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Ticket sự cố</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Tổng ticket" value={data?.tickets?.total || 0} icon={<AlertCircle size={20} />} />
          <StatCard
            title="Chờ xử lý"
            value={data?.tickets?.pending || 0}
            icon={<AlertCircle size={20} />}
            variant="danger"
          />
          <StatCard
            title="Đang xử lý"
            value={data?.tickets?.processing || 0}
            icon={<AlertCircle size={20} />}
            variant="warning"
          />
          <StatCard
            title="Đã giải quyết"
            value={data?.tickets?.resolved || 0}
            icon={<AlertCircle size={20} />}
            variant="success"
          />
        </div>
      </div>

      {/* Hợp đồng & Kho */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Hợp đồng & Kho</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="HĐ còn hiệu lực"
            value={data?.contracts?.active || 0}
            icon={<ShieldCheck size={20} />}
            variant="success"
          />
          <StatCard
            title="HĐ hết hạn"
            value={data?.contracts?.expired || 0}
            icon={<ShieldCheck size={20} />}
            variant="danger"
          />
          <StatCard title="Tổng linh kiện" value={data?.parts?.total || 0} icon={<Package size={20} />} />
          <StatCard
            title="LK sắp hết"
            value={data?.parts?.lowStock || 0}
            icon={<Package size={20} />}
            variant="warning"
            description="Dưới mức tối thiểu"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
