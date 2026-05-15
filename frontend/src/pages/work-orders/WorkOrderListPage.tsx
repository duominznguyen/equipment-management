import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getWorkOrders } from "@/services/work-order.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, Trash2, Eye, ArrowUp, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WorkOrder } from "@/types/work-order.type";
import { formatDateTime } from "@/utils/date";
import CreateWorkOrderModal from "./CreateWorkOrderModal";
import { deleteWorkOrder } from "@/services/work-order.service";
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

const WorkOrderListPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Search, filter, sort states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("pending");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");

  const { data, isLoading } = useQuery({
    queryKey: ["work-orders", page, pageSize, search, status, sortBy, sortOrder],
    queryFn: () => getWorkOrders(page, pageSize, { search, status, sortBy, sortOrder }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteWorkOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
  });

  const handleEdit = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const columns = [
    {
      key: "id",
      title: "Mã WO",
      render: (val: number) => `WO${String(val).padStart(4, "0")}`,
    },
    {
      key: "technician",
      title: "Kỹ thuật viên",
      render: (_: any, record: WorkOrder) =>
        record.technician ? `KTV${String(record.technician.id).padStart(4, "0")} - ${record.technician.fullName}` : "—",
    },
    {
      key: "source",
      title: "Nguồn việc",
      render: (_: any, record: WorkOrder) => {
        if (record.ticketId) return "Ticket sự cố";
        if (record.maintenanceScheduleId) return "Bảo trì định kỳ";
        return "Tạo thủ công";
      },
    },
    {
      key: "sourceCode",
      title: "Mã nguồn",
      render: (_: any, record: WorkOrder) => {
        if (record.ticketId) return `TK${String(record.ticketId).padStart(4, "0")}`;
        if (record.maintenanceScheduleId) return `WC${String(record.maintenanceScheduleId).padStart(4, "0")}`;
        return "—";
      },
    },
    {
      key: "workDescription",
      title: "Mô tả công việc",
      render: (val: string) =>
        val ? (
          <div className="max-w-[200px] truncate" title={val}>
            {val}
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val] || "outline"}>{statusLabels[val] || val}</Badge>,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDateTime(val),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: WorkOrder) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-primary hover:text-primary"
            title="Xem chi tiết"
            onClick={() => navigate(`/work-orders/${record.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(record)}
              disabled={record.status !== "pending"}
              title={record.status !== "pending" ? "Chỉ được sửa khi đang chờ xử lý" : "Sửa"}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          {isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={record.status !== "pending"}
                  title={record.status !== "pending" ? "Chỉ được xoá khi đang chờ xử lý" : "Xóa"}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xoá Work Order</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xoá Work Order này không? Thao tác này sẽ xoá Work Order và khôi phục trạng
                    thái cho nguồn việc liên quan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteMutation.mutate(record.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xoá
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Work Orders</h1>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo Work Order
          </Button>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
          <Input
            placeholder="Tìm theo mã WO, mô tả, KTV, Ticket, Lịch BT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-background"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full md:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Trạng thái</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[180px] h-10 bg-background">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="processing">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] h-10 bg-background">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Ngày tạo</SelectItem>
                  <SelectItem value="id">Mã Work Order</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 bg-background h-10"
              >
                {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
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

      <CreateWorkOrderModal open={isModalOpen} onClose={handleClose} workOrder={selectedWorkOrder} />
    </div>
  );
};

export default WorkOrderListPage;
