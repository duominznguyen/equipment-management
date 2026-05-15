import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMaintenanceScheduleById } from "@/services/maintenance-schedule.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Info, Wrench } from "lucide-react";
import { formatDate } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { MaintenanceSchedule } from "@/types/maintenance-schedule.type";

const getMaintenanceStatus = (record: MaintenanceSchedule) => {
  if (record.isHandled) {
    return { label: "Đã xử lý", variant: "secondary" as const };
  }
  
  if (!record.isContinueMaintain) {
    return { label: "Ngừng bảo trì", variant: "outline" as const };
  }

  if (record.nextMaintenanceDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(record.nextMaintenanceDate);
    nextDate.setHours(0, 0, 0, 0);
    
    const leadTimeDate = new Date(nextDate);
    leadTimeDate.setDate(leadTimeDate.getDate() - record.leadTimeDays);

    if (today >= nextDate) {
      return { label: "Đến hạn", variant: "destructive" as const };
    } else if (today >= leadTimeDate) {
      return { label: "Sắp tới", variant: "default" as const };
    }
  }
  
  return { label: "Chưa đến hạn", variant: "outline" as const };
};

const statusWorkOrderLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
  rejected: "Đã hủy",
};

const statusWorkOrderVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  resolved: "secondary",
  closed: "outline",
  rejected: "outline",
};

const MaintenanceScheduleDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ["maintenance-schedule", id],
    queryFn: () => getMaintenanceScheduleById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!schedule) {
    return <div className="text-center p-8 text-muted-foreground">Không tìm thấy lịch bảo trì!</div>;
  }

  const status = getMaintenanceStatus(schedule);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">
          Chi tiết Lịch bảo trì: WC{String(schedule.id).padStart(4, "0")}
        </h1>
        <Badge variant={status.variant} className="text-sm px-3 py-1">
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-primary" />
              Thông tin chung
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Thiết bị:</span>
              <span className="font-medium col-span-2">
                TB{String(schedule.device?.id || 0).padStart(4, "0")} - {schedule.device?.name || "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Chu kỳ:</span>
              <span className="font-medium col-span-2">{schedule.maintenanceIntervalDays} ngày</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Báo trước:</span>
              <span className="font-medium col-span-2">{schedule.leadTimeDays} ngày</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Tiếp tục BT:</span>
              <span className="font-medium col-span-2">{schedule.isContinueMaintain ? "Có" : "Không"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Thời gian bảo trì
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Lần bảo trì cuối:</span>
              <span className="font-medium col-span-2">
                {schedule.lastMaintenanceDate ? formatDate(schedule.lastMaintenanceDate) : "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1">Lần bảo trì tới:</span>
              <span className="font-medium col-span-2 text-primary">
                {schedule.nextMaintenanceDate ? formatDate(schedule.nextMaintenanceDate) : "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 pb-2">
              <span className="text-muted-foreground col-span-1">Đã xử lý (bỏ qua):</span>
              <span className="font-medium col-span-2">{schedule.isHandled ? "Rồi" : "Chưa"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-primary" />
            Lịch sử Lệnh làm việc (Work Orders)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.workOrders && schedule.workOrders.length > 0 ? (
            <div className="border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã WO</th>
                    <th className="px-4 py-3 font-medium">Loại</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Ngày tạo</th>
                    <th className="px-4 py-3 font-medium text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.workOrders.map((wo: any) => (
                    <tr key={wo.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">WO{String(wo.id).padStart(4, "0")}</td>
                      <td className="px-4 py-3 capitalize">{wo.type}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusWorkOrderVariants[wo.status] || "outline"}>
                          {statusWorkOrderLabels[wo.status] || wo.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{formatDate(wo.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/work-orders/${wo.id}`)}
                        >
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
              Chưa có Lệnh làm việc nào liên quan đến lịch bảo trì này.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceScheduleDetailPage;
