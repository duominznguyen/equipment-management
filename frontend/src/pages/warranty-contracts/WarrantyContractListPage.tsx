import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWarrantyContracts, deleteWarrantyContract } from "@/services/warranty-contract.service";
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
import { PlusCircle, CalendarPlus, Trash2, Search, ArrowUp, ArrowDown } from "lucide-react";
import type { WarrantyContract } from "@/types/warranty-contract.type";
import { formatDate } from "@/utils/date";
import WarrantyContractFormModal from "./WarrantyContractFormModal";

const statusLabels: Record<string, string> = {
  active: "Còn hạn",
  expiring_soon: "Sắp hết hạn",
  expired: "Hết hạn",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  expiring_soon: "secondary",
  expired: "destructive",
};

const WarrantyContractListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<WarrantyContract | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["warranty-contracts", page, pageSize, debouncedSearch, sortBy, sortOrder, status, startDate, endDate],
    queryFn: () => getWarrantyContracts(page, pageSize, {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: status === "all" ? undefined : status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarrantyContract,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warranty-contracts"] }),
  });

  const handleEdit = (contract: WarrantyContract) => {
    setSelectedContract(contract);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedContract(null);
  };

  const columns = [
    { key: "contractNumber", title: "Mã hợp đồng" },
    {
      key: "customerId",
      title: "Mã KH",
      render: (_: any, record: any) => record.device?.customer?.id ? `KH${record.device.customer.id.toString().padStart(3, "0")}` : "—",
    },
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: WarrantyContract) => record.device.name,
    },
    {
      key: "customer",
      title: "Khách hàng",
      render: (_: any, record: any) => record.device?.customer?.fullName || "—",
    },
    {
      key: "startDate",
      title: "Ngày bắt đầu",
      render: (val: string) => formatDate(val),
    },
    {
      key: "endDate",
      title: "Ngày kết thúc",
      render: (val: string) => formatDate(val),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: WarrantyContract) => (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(record)} title="Gia hạn hợp đồng">
            <CalendarPlus className="h-3 w-3" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xoá hợp đồng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc muốn xoá hợp đồng "{record.contractNumber}"? Hành động này không thể hoàn tác.
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
          <h1 className="text-2xl font-bold">Quản lý Hợp đồng Bảo hành</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm hợp đồng
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã hợp đồng, thiết bị, mã/tên khách hàng..."
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
                  <SelectItem value="active">Còn hạn</SelectItem>
                  <SelectItem value="expiring_soon">Sắp hết hạn</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
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
                    <SelectItem value="contractNumber">Mã hợp đồng</SelectItem>
                    <SelectItem value="startDate">Ngày bắt đầu</SelectItem>
                    <SelectItem value="endDate">Ngày kết thúc</SelectItem>
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

      <WarrantyContractFormModal open={isModalOpen} onClose={handleClose} contract={selectedContract} />
    </div>
  );
};

export default WarrantyContractListPage;
