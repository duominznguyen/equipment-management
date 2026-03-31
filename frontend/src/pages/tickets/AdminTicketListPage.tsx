import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, deleteTicket } from "@/services/ticket.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw } from "lucide-react";
import type { Ticket } from "@/types/ticket.type";
import { formatDateTime } from "@/utils/date";
import TicketStatusModal from "./TicketStatusModal";

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
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  resolved: "secondary",
  closed: "outline",
};

const AdminTicketListPage = () => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", page, pageSize],
    queryFn: () => getTickets(page, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const columns = [
    { key: "title", title: "Tiêu đề" },
    {
      key: "customer",
      title: "Khách hàng",
      render: (_: any, record: Ticket) => record.customer.fullName,
    },
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: Ticket) => record.device.name,
    },
    {
      key: "priority",
      title: "Ưu tiên",
      render: (val: string) => <Badge variant={priorityVariants[val]}>{priorityLabels[val]}</Badge>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDateTime(val),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: Ticket) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedTicket(record);
              setIsStatusModalOpen(true);
            }}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá ticket</AlertDialogTitle>
                <AlertDialogDescription>Bạn có chắc muốn xoá ticket "{record.title}"?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Huỷ</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate(record.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Xoá
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Ticket sự cố</h1>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      <TicketStatusModal
        open={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        queryKey="tickets"
      />
    </div>
  );
};

export default AdminTicketListPage;
