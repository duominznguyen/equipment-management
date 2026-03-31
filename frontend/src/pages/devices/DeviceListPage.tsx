import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDevices, deleteDevice } from "@/services/device.service";
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
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import type { Device } from "@/types/device.type";
import { formatDate } from "@/utils/date";
import DeviceFormModal from "./DeviceFormModal";

const statusLabels: Record<string, string> = {
  active: "Đang hoạt động",
  maintaining: "Đang bảo trì",
  broken: "Hỏng",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  maintaining: "secondary",
  broken: "destructive",
};

const DeviceListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["devices", page, pageSize],
    queryFn: () => getDevices(page, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["devices"] }),
  });

  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedDevice(null);
  };

  const columns = [
    { key: "name", title: "Tên thiết bị" },
    {
      key: "category",
      title: "Loại",
      render: (_: any, record: Device) => record.category.name,
    },
    {
      key: "customer",
      title: "Khách hàng",
      render: (_: any, record: Device) => record.customer.fullName,
    },
    { key: "brand", title: "Hãng" },
    { key: "model", title: "Model" },
    { key: "serialNumber", title: "Số serial" },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    {
      key: "purchaseDate",
      title: "Ngày mua",
      render: (val: string) => (val ? formatDate(val) : "—"),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: Device) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá thiết bị</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xoá thiết bị "{record.name}"? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
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
        <h1 className="text-2xl font-bold">Quản lý Thiết bị</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm thiết bị
        </Button>
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

      <DeviceFormModal open={isModalOpen} onClose={handleClose} device={selectedDevice} />
    </div>
  );
};

export default DeviceListPage;
