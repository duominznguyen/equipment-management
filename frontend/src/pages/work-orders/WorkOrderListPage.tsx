import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getWorkOrders, updateWorkOrderStatus } from "@/services/work-order.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, RefreshCw } from "lucide-react";
import type { WorkOrder } from "@/types/work-order.type";
import { formatDateTime } from "@/utils/date";
import CreateWorkOrderModal from "./CreateWorkOrderModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const { data, isLoading } = useQuery({
    queryKey: ["work-orders", page, pageSize],
    queryFn: () => getWorkOrders(page, pageSize),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateWorkOrderStatus(id, status),
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
      title: "Mã",
      render: (val: number) => `#${val}`,
    },
    {
      key: "technician",
      title: "Kỹ thuật viên",
      render: (_: any, record: WorkOrder) => record.technician?.fullName || "—",
    },
    {
      key: "ticket",
      title: "Ticket",
      render: (_: any, record: WorkOrder) => (record.ticket ? `#${record.ticket.id} - ${record.ticket.title}` : "—"),
    },
    {
      key: "schedule",
      title: "Lịch bảo trì",
      render: (_: any, record: WorkOrder) => (record.maintenanceSchedule ? `#${record.maintenanceSchedule.id} (${record.maintenanceSchedule.device?.name})` : "—"),
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
          {isAdmin && (
            <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
              <Pencil className="h-3 w-3" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <RefreshCw className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => statusMutation.mutate({ id: record.id, status: value })}
                  disabled={record.status === value}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
