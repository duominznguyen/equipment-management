import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getMaintenanceRequests, updateMaintenanceStatus } from "@/services/maintenance-request.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Pencil, RefreshCw } from "lucide-react";
import type { MaintenanceRequest } from "@/types/maintenance-request.type";
import { formatDate } from "@/utils/date";
import MaintenanceRequestFormModal from "./MaintenanceRequestFormModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const typeLabels: Record<string, string> = {
  repair: "Sửa chữa",
  periodic: "Định kỳ",
};

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

const MaintenanceRequestListPage = () => {
  const { user } = useAuthStore(); // ← thêm dòng này
  const isAdmin = user?.role === "admin";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance-requests", page, pageSize],
    queryFn: () => getMaintenanceRequests(page, pageSize),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateMaintenanceStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] }),
  });

  const handleEdit = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const columns = [
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: MaintenanceRequest) => record.device.name,
    },
    {
      key: "technician",
      title: "Kỹ thuật viên",
      render: (_: any, record: MaintenanceRequest) => record.technician.fullName,
    },
    {
      key: "ticket",
      title: "Ticket",
      render: (_: any, record: MaintenanceRequest) => (record.ticket ? `#${record.ticket.id}` : "—"),
    },
    {
      key: "type",
      title: "Loại",
      render: (val: string) => typeLabels[val],
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDate(val),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: MaintenanceRequest) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
            <Pencil className="h-3 w-3" />
          </Button>
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
        <h1 className="text-2xl font-bold">Quản lý Phiếu bảo trì</h1>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo phiếu bảo trì
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

      <MaintenanceRequestFormModal open={isModalOpen} onClose={handleClose} request={selectedRequest} />
    </div>
  );
};

export default MaintenanceRequestListPage;
