import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMaintenanceSchedules,
  getMySchedules,
  updateScheduleStatus,
  deleteMaintenanceSchedule,
} from "@/services/maintenance-schedule.service";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircle, Pencil, Trash2, RefreshCw } from "lucide-react";
import type { MaintenanceSchedule } from "@/types/maintenance-schedule.type";
import { formatDate } from "@/utils/date";
import { useAuthStore } from "@/stores/auth.store";
import MaintenanceScheduleFormModal from "./MaintenanceScheduleFormModal";

const statusLabels: Record<string, string> = {
  upcoming: "Sắp tới",
  completed: "Hoàn thành",
  overdue: "Quá hạn",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  upcoming: "default",
  completed: "secondary",
  overdue: "destructive",
};

const MaintenanceScheduleListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const queryClient = useQueryClient();

  const queryKey = isCustomer ? "my-schedules" : "maintenance-schedules";

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, page, pageSize],
    queryFn: () => (isCustomer ? getMySchedules(page, pageSize) : getMaintenanceSchedules(page, pageSize)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updateScheduleStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMaintenanceSchedule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [queryKey] }),
  });

  const handleEdit = (schedule: MaintenanceSchedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);
  };

  const columns = [
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: MaintenanceSchedule) => record.device.name,
    },
    {
      key: "technician",
      title: "Kỹ thuật viên",
      render: (_: any, record: MaintenanceSchedule) => record.technician.fullName,
    },
    {
      key: "scheduledDate",
      title: "Ngày bảo trì",
      render: (val: string) => formatDate(val),
    },
    {
      key: "description",
      title: "Mô tả",
      render: (val: string) => val || "—",
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    ...(!isCustomer
      ? [
          {
            key: "actions",
            title: "Thao tác",
            render: (_: any, record: MaintenanceSchedule) => (
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
                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xoá lịch bảo trì</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc muốn xoá lịch bảo trì này?</AlertDialogDescription>
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
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isCustomer ? "Lịch bảo trì của tôi" : "Quản lý Lịch bảo trì"}</h1>
        {isAdmin && (
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo lịch bảo trì
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

      {isAdmin && <MaintenanceScheduleFormModal open={isModalOpen} onClose={handleClose} schedule={selectedSchedule} />}
    </div>
  );
};

export default MaintenanceScheduleListPage;
