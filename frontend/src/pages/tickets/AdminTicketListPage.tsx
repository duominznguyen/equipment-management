import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTickets, deleteTicket } from "@/services/ticket.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Settings, XCircle, Wrench, Search, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "@/types/ticket.type";
import { formatDateTime } from "@/utils/date";
import TicketRejectModal from "./TicketRejectModal";
import CreateWorkOrderModal from "../work-orders/CreateWorkOrderModal";

const priorityLabels: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};
const priorityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};
const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
  rejected: "Đã từ chối"
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  resolved: "secondary",
  closed: "outline",
  rejected: "outline"
};

const AdminTicketListPage = () => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectTicketId, setRejectTicketId] = useState<number | null>(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderData, setWorkOrderData] = useState<any>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["tickets", page, pageSize, debouncedSearch, startDate, endDate, statusFilter, sortBy, sortOrder],
    queryFn: () => getTickets(page, pageSize, {
      search: debouncedSearch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      sortBy,
      sortOrder,
    }),
  });

  const columns = [
    { key: "id", title: "Mã Ticket", render: (val: number) => `TK${val.toString().padStart(4, "0")}` },
    { key: "title", title: "Tiêu đề" },
    {
      key: "customerId",
      title: "Mã KH",
      render: (_: any, record: Ticket) => {
        if (!record.device?.customer) return "—";
        return `KH${record.device.customer.id.toString().padStart(4, "0")}`;
      },
    },
    {
      key: "customerName",
      title: "Khách hàng",
      render: (_: any, record: Ticket) => {
        if (!record.device?.customer) return "—";
        return record.device.customer.fullName;
      },
    },
    {
      key: "deviceId",
      title: "Mã TB",
      render: (_: any, record: Ticket) => `TB${record.device.id.toString().padStart(4, "0")}`,
    },
    {
      key: "deviceName",
      title: "Thiết bị",
      render: (_: any, record: Ticket) => record.device.name,
    },
    {
      key: "priority",
      title: "Ưu tiên",
      render: (val: string) => <Badge variant={priorityVariants[val]}>{priorityLabels[val]}</Badge>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (_: any, record: Ticket) => (
        <div className="flex flex-col items-start gap-1">
          <Badge variant={statusVariants[record.status]}>{statusLabels[record.status]}</Badge>
          {record.status === 'rejected' && record.rejectionReason && (
            <span className="text-xs text-muted-foreground line-clamp-1" title={record.rejectionReason}>
              Lý do: {record.rejectionReason}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDateTime(val),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: Ticket) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-primary hover:text-primary"
            title="Xem chi tiết"
            onClick={() => navigate(`/tickets/${record.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {record.status === 'pending' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" title="Xử lý">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-primary focus:text-primary cursor-pointer"
                  onClick={() => {
                    setWorkOrderData({
                      ticketId: record.id,
                      referenceInfo: `Xử lý sự cố: ${record.title}`,
                    });
                    setIsWorkOrderModalOpen(true);
                  }}
                >
                  <Wrench className="h-4 w-4 mr-2" /> Xử lý (Tạo WO)
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => {
                    setRejectTicketId(record.id);
                    setIsRejectModalOpen(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" /> Từ chối
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" variant="outline" disabled title="Không có thao tác">
              <Settings className="h-4 w-4 opacity-50" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Ticket sự cố</h1>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tiêu đề, mô tả, khách hàng, thiết bị hoặc các mã (TK, KH, TB)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-background w-full h-10"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Khoảng thời gian tạo</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background h-10 w-full md:w-auto"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background h-10 w-full md:w-auto"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background w-full md:w-36 h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="processing">Đang xử lý</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  <SelectItem value="closed">Đã đóng</SelectItem>
                  <SelectItem value="rejected">Đã từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background w-full md:w-40 h-10">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Ngày tạo</SelectItem>
                    <SelectItem value="id">Mã Ticket</SelectItem>
                    <SelectItem value="status">Trạng thái</SelectItem>
                    <SelectItem value="priority">Ưu tiên</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-3 bg-background h-10"
                >
                  {sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
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

      <TicketRejectModal
        open={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setRejectTicketId(null);
        }}
        ticketId={rejectTicketId}
      />

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

export default AdminTicketListPage;
