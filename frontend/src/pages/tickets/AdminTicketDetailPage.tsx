import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTickets } from "@/services/ticket.service"; // Need a getById?
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/utils/date";
import { ArrowLeft } from "lucide-react";
import type { Ticket } from "@/types/ticket.type";

const priorityLabels: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};
const priorityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};
const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
  rejected: "Đã từ chối"
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  resolved: "secondary",
  closed: "outline",
  rejected: "outline"
};

const getTicketById = async (id: number) => {
  const res = await api.get(`/tickets/${id}`);
  return res.data;
};

const AdminTicketDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => getTicketById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8">Đang tải...</div>;
  if (error || !ticket) return <div className="p-8 text-destructive">Không tìm thấy Ticket</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          Chi tiết Ticket: TK{ticket.id.toString().padStart(4, "0")}
        </h1>
        <Badge variant={statusVariants[ticket.status]}>{statusLabels[ticket.status]}</Badge>
        <Badge variant={priorityVariants[ticket.priority]}>{priorityLabels[ticket.priority]}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin chung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Tiêu đề</label>
              <p className="font-medium">{ticket.title}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Mô tả chi tiết</label>
              <p className="whitespace-pre-wrap mt-1">{ticket.description}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ngày tạo</label>
              <p>{formatDateTime(ticket.createdAt)}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Cập nhật lần cuối</label>
              <p>{formatDateTime(ticket.updatedAt)}</p>
            </div>
            {ticket.status === 'rejected' && ticket.rejectionReason && (
              <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <label className="text-sm text-destructive font-semibold">Lý do từ chối</label>
                <p className="text-destructive mt-1">{ticket.rejectionReason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin Thiết bị</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Mã Thiết bị</label>
                <p className="font-medium">TB{ticket.device?.id.toString().padStart(4, "0")}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Tên Thiết bị</label>
                <p>{ticket.device?.name}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Số Serial</label>
                <p>{ticket.device?.serialNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin Khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.device?.customer ? (
                <>
                  <div>
                    <label className="text-sm text-muted-foreground">Mã Khách hàng</label>
                    <p className="font-medium">KH{ticket.device.customer.id.toString().padStart(4, "0")}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Tên Khách hàng</label>
                    <p>{ticket.device.customer.fullName}</p>
                  </div>
                  {ticket.device.customer.phone && (
                    <div>
                      <label className="text-sm text-muted-foreground">Số điện thoại</label>
                      <p>{ticket.device.customer.phone}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground italic">Không có thông tin khách hàng</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketDetailPage;
