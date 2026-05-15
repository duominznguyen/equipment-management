import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDevices, deleteDevice } from "@/services/device.service";
import { getAllDeviceCategories } from "@/services/device-category.service";
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
import { PlusCircle, Pencil, Trash2, Search, ArrowUp, ArrowDown } from "lucide-react";
import type { Device } from "@/types/device.type";
import { formatDate } from "@/utils/date";
import DeviceFormModal from "./DeviceFormModal";

const statusLabels: Record<string, string> = {
  active: "Hoạt động",
  inactive: "Ngừng HĐ",
  maintaining: "Bảo trì",
  broken: "Đang lỗi",
  error: "Đang lỗi",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "outline",
  maintaining: "secondary",
  broken: "destructive",
  error: "destructive",
};

const DeviceListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categories } = useQuery({
    queryKey: ["device-categories", "all"],
    queryFn: getAllDeviceCategories,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["devices", page, pageSize, debouncedSearch, sortBy, sortOrder, status, categoryId, startDate, endDate],
    queryFn: () =>
      getDevices(page, pageSize, {
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        status: status === "all" ? undefined : status,
        categoryId: categoryId === "all" ? undefined : categoryId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
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
      key: "customerId",
      title: "Mã KH",
      render: (_: any, record: Device) => `KH${record.customer.id.toString().padStart(3, "0")}`,
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
      render: (val: string) => <Badge className="whitespace-nowrap" variant={statusVariants[val] || "outline"}>{statusLabels[val] || val}</Badge>,
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Thiết bị</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm thiết bị
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tên thiết bị, mã/tên khách hàng, serial, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-background w-full"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
                  <SelectItem value="maintaining">Bảo trì</SelectItem>
                  <SelectItem value="broken">Đang lỗi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Loại thiết bị</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Chọn loại thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sắp xếp theo</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background flex-1">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Ngày thêm</SelectItem>
                    <SelectItem value="name">Tên thiết bị</SelectItem>
                    <SelectItem value="serialNumber">Số Serial</SelectItem>
                    <SelectItem value="brand">Hãng sản xuất</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 bg-background"
                  title={sortOrder === "asc" ? "Tăng dần" : "Giảm dần"}
                >
                  {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Mua từ ngày</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Đến ngày</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background"
              />
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

      <DeviceFormModal open={isModalOpen} onClose={handleClose} device={selectedDevice} />
    </div>
  );
};

export default DeviceListPage;
