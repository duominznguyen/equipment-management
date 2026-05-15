import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getWorkOrderById } from "@/services/work-order.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Info, User, Wrench, CalendarDays, FileText } from "lucide-react";
import { formatDateTime } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  completed: "Hoàn thành",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  completed: "secondary",
};

const WorkOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: workOrder, isLoading } = useQuery({
    queryKey: ["work-order", id],
    queryFn: () => getWorkOrderById(Number(id)),
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

  if (!workOrder) {
    return <div className="text-center p-8 text-muted-foreground">Không tìm thấy Work Order!</div>;
  }

  const getSourceDisplay = () => {
    if (workOrder.ticketId) {
      return (
        <span
          className="text-primary hover:underline cursor-pointer"
          onClick={() => navigate(`/tickets/${workOrder.ticketId}`)}
        >
          Ticket sự cố: TK{String(workOrder.ticketId).padStart(4, "0")}
        </span>
      );
    }
    if (workOrder.maintenanceScheduleId) {
      return (
        <span
          className="text-primary hover:underline cursor-pointer"
          onClick={() => navigate(`/maintenance-schedules/${workOrder.maintenanceScheduleId}`)}
        >
          Lịch bảo trì: WC{String(workOrder.maintenanceScheduleId).padStart(4, "0")}
        </span>
      );
    }
    return <span>Tạo thủ công</span>;
  };

  const getDeviceDisplay = () => {
    if (workOrder.ticket?.device) {
      return `TB${String(workOrder.ticket.device.id).padStart(4, "0")} - ${workOrder.ticket.device.name}`;
    }
    if (workOrder.maintenanceSchedule?.device) {
      return `TB${String(workOrder.maintenanceSchedule.device.id).padStart(4, "0")} - ${workOrder.maintenanceSchedule.device.name}`;
    }
    return "—";
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">
          Chi tiết Work Order: WO{String(workOrder.id).padStart(4, "0")}
        </h1>
        <Badge variant={statusVariants[workOrder.status] || "outline"} className="text-sm px-3 py-1">
          {statusLabels[workOrder.status] || workOrder.status}
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
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <FileText className="h-4 w-4" /> Nguồn việc:
              </span>
              <span className="font-medium col-span-2">{getSourceDisplay()}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <Wrench className="h-4 w-4" /> Thiết bị:
              </span>
              <span className="font-medium col-span-2">{getDeviceDisplay()}</span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <User className="h-4 w-4" /> Kỹ thuật viên:
              </span>
              <span className="font-medium col-span-2">
                {workOrder.technician ? (
                  <>
                    KTV{String(workOrder.technician.id).padStart(4, "0")} - {workOrder.technician.fullName}
                    <div className="text-xs text-muted-foreground font-normal">{workOrder.technician.phone}</div>
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-primary" />
              Thời gian thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <CalendarDays className="h-4 w-4" /> Ngày tạo:
              </span>
              <span className="font-medium col-span-2">
                {workOrder.createdAt ? formatDateTime(workOrder.createdAt) : "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Bắt đầu lúc:
              </span>
              <span className="font-medium col-span-2 text-blue-600">
                {workOrder.startedAt ? formatDateTime(workOrder.startedAt) : "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 border-b pb-2">
              <span className="text-muted-foreground col-span-1 flex items-center gap-1">
                <Clock className="h-4 w-4" /> Hoàn thành lúc:
              </span>
              <span className="font-medium col-span-2 text-green-600">
                {workOrder.completedAt ? formatDateTime(workOrder.completedAt) : "—"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mô tả công việc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-md whitespace-pre-wrap">
            {workOrder.workDescription || <span className="text-muted-foreground italic">Không có mô tả chi tiết</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5 text-primary" />
            Linh kiện sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          {workOrder.partUsages && workOrder.partUsages.length > 0 ? (
            <div className="border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã linh kiện</th>
                    <th className="px-4 py-3 font-medium">Tên linh kiện</th>
                    <th className="px-4 py-3 font-medium text-right">Số lượng sử dụng</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrder.partUsages.map((usage: any) => (
                    <tr key={usage.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">LK{String(usage.partId).padStart(4, "0")}</td>
                      <td className="px-4 py-3">{usage.part?.name || "—"}</td>
                      <td className="px-4 py-3 text-right font-medium">{usage.quantityUsage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
              Chưa có linh kiện nào được sử dụng cho công việc này.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderDetailPage;
