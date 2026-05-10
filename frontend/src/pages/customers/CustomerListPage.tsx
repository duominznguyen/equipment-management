import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, deleteCustomer, toggleLockCustomer } from "@/services/customer.service";
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
import { PlusCircle, Pencil, Trash2, Search, ArrowUp, ArrowDown, Lock, Unlock } from "lucide-react";
import type { Customer } from "@/types/customer.type";
import { formatDate } from "@/utils/date";
import CustomerFormModal from "./CustomerFormModal";

const CustomerListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isActive, setIsActive] = useState("true");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [customerToLock, setCustomerToLock] = useState<Customer | null>(null);
  const [lockReason, setLockReason] = useState("");
  
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, pageSize, debouncedSearch, sortBy, sortOrder, isActive, startDate, endDate],
    queryFn: () => getCustomers(page, pageSize, {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      isActive: isActive === "all" ? undefined : isActive,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });

  const toggleLockMutation = useMutation({
    mutationFn: ({ id, active, reason }: { id: number; active: boolean; reason?: string }) =>
      toggleLockCustomer(id, active, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setCustomerToLock(null);
      setLockReason("");
    },
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const columns = [
    {
      key: "fullName",
      title: "Họ tên",
    },
    {
      key: "username",
      title: "Username",
      render: (_: any, record: Customer) => record.user.username,
    },
    {
      key: "email",
      title: "Email",
      render: (_: any, record: Customer) => record.user.email,
    },
    {
      key: "phone",
      title: "Số điện thoại",
    },
    {
      key: "additionalInfo",
      title: "Thông tin thêm",
      render: (val: string) => val || "—",
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (_: any, record: Customer) => (
        <Badge 
          variant={record.user.isActive ? "default" : "destructive"}
          title={!record.user.isActive && record.user.lockReason ? `Lý do: ${record.user.lockReason}` : undefined}
        >
          {record.user.isActive ? "Hoạt động" : "Đã khoá"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDate(val),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: Customer) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
            <Pencil className="h-3 w-3" />
          </Button>
          {record.user.isActive ? (
            <Button size="sm" variant="outline" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50" onClick={() => setCustomerToLock(record)}>
              <Lock className="h-3 w-3" />
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => toggleLockMutation.mutate({ id: record.id, active: true })}>
              <Unlock className="h-3 w-3" />
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá khách hàng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xoá khách hàng "{record.fullName}"? Hành động này không thể hoàn tác.
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
          <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm khách hàng
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm họ tên, username, email, SĐT..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-background w-full"
            />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
              <Select value={isActive} onValueChange={setIsActive}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="true">Đang hoạt động</SelectItem>
                  <SelectItem value="false">Đã khoá</SelectItem>
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
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    <SelectItem value="fullName">Họ tên</SelectItem>
                    <SelectItem value="username">Username</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
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
              <label className="text-xs font-medium text-muted-foreground">Từ ngày</label>
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

      <CustomerFormModal open={isModalOpen} onClose={handleClose} customer={selectedCustomer} />

      <AlertDialog open={!!customerToLock} onOpenChange={(open) => !open && setCustomerToLock(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khoá tài khoản khách hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn đang chuẩn bị khoá tài khoản của "{customerToLock?.fullName}". Vui lòng nhập lý do khoá tài khoản:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nhập lý do khoá (bắt buộc)"
              value={lockReason}
              onChange={(e) => setLockReason(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              disabled={!lockReason.trim()}
              onClick={() => {
                if (customerToLock && lockReason.trim()) {
                  toggleLockMutation.mutate({ id: customerToLock.id, active: false, reason: lockReason.trim() });
                }
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Khoá tài khoản
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerListPage;
