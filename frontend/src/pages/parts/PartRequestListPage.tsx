import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartExports, getPartImports } from "@/services/part.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUp, ArrowDown, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDateTime } from "@/utils/date";
import { Badge } from "@/components/ui/badge";
import RequestPartActionModal from "./RequestPartActionModal";

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "destructive",
  approved: "secondary",
  completed: "default",
  cancelled: "outline",
};

const PartRequestListPage = () => {
  const navigate = useNavigate();
  const [requestModalState, setRequestModalState] = useState<{ open: boolean; type: "export" | "import" | null }>({
    open: false,
    type: null,
  });

  // Pagination (Local)
  const { page, pageSize, setPage, setPageSize } = usePagination();

  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [requestType, setRequestType] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch all matching records (ignoring pagination on backend)
  const { data: exportsData, isLoading: isExportsLoading } = useQuery({
    queryKey: ["part-exports", "all", debouncedSearch, startDate, endDate, statusFilter],
    queryFn: () =>
      getPartExports(1, 1000, {
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const { data: importsData, isLoading: isImportsLoading } = useQuery({
    queryKey: ["part-imports", "all", debouncedSearch, startDate, endDate, statusFilter],
    queryFn: () =>
      getPartImports(1, 1000, {
        search: debouncedSearch || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
  });

  const combinedData = useMemo(() => {
    let combined: any[] = [];

    if (requestType === "all" || requestType === "export") {
      const exports = (exportsData?.data || []).map((item: any) => ({
        ...item,
        _type: "export",
        _date: item.exportDate,
        _code: `PX${item.id.toString().padStart(4, "0")}`,
        _reason: item.reason,
      }));
      combined = [...combined, ...exports];
    }

    if (requestType === "all" || requestType === "import") {
      const imports = (importsData?.data || []).map((item: any) => ({
        ...item,
        _type: "import",
        _date: item.importDate,
        _code: `PN${item.id.toString().padStart(4, "0")}`,
        _reason: item.reason || item.note,
      }));
      combined = [...combined, ...imports];
    }

    // Sort
    combined.sort((a, b) => {
      let valA, valB;
      if (sortBy === "date") {
        valA = new Date(a._date || 0).getTime();
        valB = new Date(b._date || 0).getTime();
      } else if (sortBy === "id") {
        valA = a.id;
        valB = b.id;
      } else {
        valA = a.status;
        valB = b.status;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return combined;
  }, [exportsData, importsData, requestType, sortBy, sortOrder]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, startDate, endDate, statusFilter, requestType, sortBy, sortOrder, setPage]);

  const paginatedData = combinedData.slice((page - 1) * pageSize, page * pageSize);
  const total = combinedData.length;
  const isLoading = isExportsLoading || isImportsLoading;

  const columns = [
    {
      key: "code",
      title: "Mã phiếu",
      render: (_: any, record: any) => <span className="font-medium">{record._code}</span>,
    },
    {
      key: "type",
      title: "Loại",
      render: (_: any, record: any) => (record._type === "export" ? "Xuất linh kiện" : "Trả linh kiện"),
    },
    { key: "details", title: "SL Chi tiết", render: (_: any, record: any) => `${record.details?.length || 0} mục` },
    { key: "date", title: "Thời gian", render: (_: any, record: any) => formatDateTime(record._date) },
    {
      key: "status",
      title: "Trạng thái",
      render: (_: any, record: any) => (
        <Badge variant={statusVariants[record.status] || "outline"}>
          {statusLabels[record.status] || record.status}
        </Badge>
      ),
    },
    { key: "reason", title: "Lý do/Ghi chú", render: (_: any, record: any) => record._reason || "—" },
    {
      key: "actions",
      title: "Thao tác",
      render: (_: any, record: any) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            navigate(record._type === "export" ? `/tech/part-exports/${record.id}` : `/part-imports/${record.id}`)
          }
          title="Xem chi tiết"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Lịch sử Yêu cầu Linh kiện</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setRequestModalState({ open: true, type: "export" })}>
              Yêu cầu xuất linh kiện
            </Button>
            <Button variant="secondary" onClick={() => setRequestModalState({ open: true, type: "import" })}>
              Yêu cầu trả linh kiện
            </Button>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm lý do, mã phiếu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-background w-full h-10"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto flex-wrap">
            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Loại yêu cầu</label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger className="bg-background w-full md:w-36 h-10">
                  <SelectValue placeholder="Loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="export">Xuất linh kiện</SelectItem>
                  <SelectItem value="import">Trả linh kiện</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Khoảng thời gian (Từ ngày - Đến ngày)</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background h-10 w-full md:w-[130px]"
                  title="Từ ngày"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background h-10 w-full md:w-[130px]"
                  title="Đến ngày"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background w-full md:w-36 h-10">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Thời gian</SelectItem>
                    <SelectItem value="id">Mã phiếu</SelectItem>
                    <SelectItem value="status">Trạng thái</SelectItem>
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
        </div>
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={paginatedData}
          total={total}
          page={page}
          pageSize={pageSize}
          loading={isLoading}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <RequestPartActionModal
        open={requestModalState.open}
        onClose={() => setRequestModalState({ open: false, type: null })}
        actionType={requestModalState.type}
        initialSelectedParts={[]}
      />
    </div>
  );
};

export default PartRequestListPage;
