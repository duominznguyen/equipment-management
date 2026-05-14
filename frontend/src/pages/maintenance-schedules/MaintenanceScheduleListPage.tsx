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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { PlusCircle, Pencil, Trash2, Settings, FilePlus, XCircle, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { MaintenanceSchedule } from "@/types/maintenance-schedule.type";
import { formatDate } from "@/utils/date";
import { useAuthStore } from "@/stores/auth.store";
import MaintenanceScheduleFormModal from "./MaintenanceScheduleFormModal";
import CreateWorkOrderModal from "../work-orders/CreateWorkOrderModal";

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

const MaintenanceScheduleListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<MaintenanceSchedule | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderData, setWorkOrderData] = useState<any>(null);
  
  // Search, filter, sort states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("unhandled");
  const [sortBy, setSortBy] = useState("nextMaintenanceDate");
  const [order, setOrder] = useState("asc");

  const { page, pageSize, setPage, setPageSize } = usePagination();
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const queryKey = isCustomer ? "my-schedules" : "maintenance-schedules";

  const { data, isLoading } = useQuery({
    queryKey: [queryKey, page, pageSize, search, status, sortBy, order],
    queryFn: () => {
      const filters = { search, status, sortBy, order };
      return isCustomer ? getMySchedules(page, pageSize, filters) : getMaintenanceSchedules(page, pageSize, filters);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isHandled }: { id: number; isHandled: boolean }) => updateScheduleStatus(id, isHandled),
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
      key: "id",
      title: "Mã lịch bảo trì",
      render: (val: number) => `WC${String(val).padStart(4, "0")}`,
    },
    {
      key: "deviceCode",
      title: "Mã thiết bị",
      render: (_: any, record: MaintenanceSchedule) => `TB${String(record.device?.id || 0).padStart(4, "0")}`,
    },
    {
      key: "device",
      title: "Tên thiết bị",
      render: (_: any, record: MaintenanceSchedule) => record.device?.name || "—",
    },
    {
      key: "nextMaintenanceDate",
      title: "Ngày bảo trì tiếp theo",
      render: (val: string) => val ? formatDate(val) : "—",
    },
    {
      key: "lastMaintenanceDate",
      title: "Lần bảo trì cuối",
      render: (val: string) => val ? formatDate(val) : "—",
    },
    {
      key: "isContinueMaintain",
      title: "Tiếp tục bảo trì",
      render: (val: boolean) => (
        <Badge variant={val ? "outline" : "secondary"}>
          {val ? "Có" : "Không"}
        </Badge>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_: any, record: MaintenanceSchedule) => {
        const status = getMaintenanceStatus(record);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    ...(!isCustomer
      ? [
          {
            key: "actions",
            title: "Thao tác",
            render: (_: any, record: MaintenanceSchedule) => (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-primary hover:text-primary"
                  title="Xem chi tiết"
                  onClick={() => {
                    if (isCustomer) navigate(`/my/schedules/${record.id}`);
                    else if (isAdmin) navigate(`/maintenance-schedules/${record.id}`);
                    else navigate(`/tech/maintenance-schedules/${record.id}`);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      title="Xử lý"
                      disabled={record.isHandled === true}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => {
                        setWorkOrderData({
                          maintenanceScheduleId: record.id,
                          referenceInfo: `Bảo trì định kỳ thiết bị: ${record.device.name}`,
                          deviceCategoryId: record.device?.categoryId,
                        });
                        setIsWorkOrderModalOpen(true);
                      }}
                      disabled={record.isHandled === true}
                      className={record.isHandled ? "opacity-50" : ""}
                    >
                      <FilePlus className="mr-2 h-4 w-4" />
                      Tạo lệnh làm việc
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => statusMutation.mutate({ id: record.id, isHandled: true })}
                      disabled={record.isHandled === true}
                      className={record.isHandled ? "opacity-50" : ""}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Bỏ qua lần bảo trì này
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {isAdmin && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    title="Chỉnh sửa"
                    onClick={() => handleEdit(record)}
                    disabled={(record._count?.workOrders ?? 0) > 0}
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
                        title="Xóa"
                        disabled={(record._count?.workOrders ?? 0) > 0}
                      >
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

      <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
          <Input
            placeholder="Tìm tên, mã thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 bg-background"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="w-full md:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Trạng thái</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[220px] h-10 bg-background">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="unhandled">Chưa xử lý (Đến hạn, sắp tới)</SelectItem>
                <SelectItem value="due">Đến hạn</SelectItem>
                <SelectItem value="upcoming">Sắp tới</SelectItem>
                <SelectItem value="not_due">Chưa đến hạn</SelectItem>
                <SelectItem value="handled">Đã xử lý</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full md:w-auto">
            <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[200px] h-10 bg-background">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nextMaintenanceDate">Ngày bảo trì tiếp theo</SelectItem>
                  <SelectItem value="lastMaintenanceDate">Lần bảo trì cuối</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={() => setOrder(order === "asc" ? "desc" : "asc")}
                className="px-3 bg-background h-10"
              >
                {order === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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

      {isAdmin && <MaintenanceScheduleFormModal open={isModalOpen} onClose={handleClose} schedule={selectedSchedule} />}

      <CreateWorkOrderModal
        open={isWorkOrderModalOpen}
        onClose={() => {
          setIsWorkOrderModalOpen(false);
          setWorkOrderData(null);
        }}
        defaultData={workOrderData}
      />
    </div>
  );
};

export default MaintenanceScheduleListPage;
