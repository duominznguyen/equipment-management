import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeviceCategories, deleteDeviceCategory } from "@/services/device-category.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
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
import type { DeviceCategory } from "@/types/device-category.type";
import DeviceCategoryFormModal from "./DeviceCategoryFormModal";

const DeviceCategoryListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["device-categories", page, pageSize],
    queryFn: () => getDeviceCategories(page, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDeviceCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["device-categories"] }),
  });

  const handleEdit = (category: DeviceCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const columns = [
    { key: "id", title: "ID" },
    { key: "name", title: "Tên loại thiết bị" },
    {
      key: "description",
      title: "Mô tả",
      render: (val: string) => val || "—",
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: DeviceCategory) => (
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
                <AlertDialogTitle>Xoá loại thiết bị</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xoá loại thiết bị "{record.name}"? Hành động này không thể hoàn tác.
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
        <h1 className="text-2xl font-bold">Quản lý Loại thiết bị</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm loại thiết bị
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

      <DeviceCategoryFormModal open={isModalOpen} onClose={handleClose} category={selectedCategory} />
    </div>
  );
};

export default DeviceCategoryListPage;
