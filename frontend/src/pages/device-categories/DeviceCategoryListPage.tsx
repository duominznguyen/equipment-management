import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeviceCategories, deleteDeviceCategory } from "@/services/device-category.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
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
import { PlusCircle, Pencil, Trash2, Search, ArrowUp, ArrowDown } from "lucide-react";
import type { DeviceCategory } from "@/types/device-category.type";
import DeviceCategoryFormModal from "./DeviceCategoryFormModal";

const DeviceCategoryListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");

  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["device-categories", page, pageSize, debouncedSearch, sortBy, sortOrder],
    queryFn: () => getDeviceCategories(page, pageSize, {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
    }),
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Loại thiết bị</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm loại thiết bị
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col md:flex-row gap-4 items-end">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm loại thiết bị, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-background w-full h-10"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-background w-full md:w-48 h-10">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Mã loại thiết bị</SelectItem>
                <SelectItem value="name">Tên loại thiết bị</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 bg-background h-10"
              title={sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
            >
              {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
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

      <DeviceCategoryFormModal open={isModalOpen} onClose={handleClose} category={selectedCategory} />
    </div>
  );
};

export default DeviceCategoryListPage;
