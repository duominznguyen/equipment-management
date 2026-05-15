import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import { getParts, deletePart } from "@/services/part.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Part } from "@/types/part.type";
import PartFormModal from "./PartFormModal";
import RequestPartActionModal from "./RequestPartActionModal";

const PartListPage = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [status, setStatus] = useState("all");
  
  const [rowSelection, setRowSelection] = useState<Record<number, Part>>({});
  const [requestModalState, setRequestModalState] = useState<{ open: boolean; type: "export" | "import" | null }>({ open: false, type: null });

  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ["parts", page, pageSize, debouncedSearch, sortBy, sortOrder, status],
    queryFn: () => getParts(page, pageSize, {
      search: debouncedSearch || undefined,
      sortBy,
      sortOrder,
      status: status === "all" ? undefined : status,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePart,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["parts"] }),
  });

  const handleEdit = (part: Part) => {
    setSelectedPart(part);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedPart(null);
  };

  const baseColumns = [
    {
      key: "select",
      title: (
        <Checkbox
          checked={data?.data && data.data.length > 0 && data.data.every((record: Part) => !!rowSelection[record.id])}
          onCheckedChange={(val) => {
            setRowSelection(prev => {
              const newSelection = { ...prev };
              if (val) {
                data?.data?.forEach((record: Part) => {
                  newSelection[record.id] = record;
                });
              } else {
                data?.data?.forEach((record: Part) => {
                  delete newSelection[record.id];
                });
              }
              return newSelection;
            });
          }}
          aria-label="Select all"
        />
      ),
      render: (_: any, record: Part) => (
        <Checkbox
          checked={!!rowSelection[record.id]}
          onCheckedChange={(val) => setRowSelection(prev => {
            const next = { ...prev };
            if (val) next[record.id] = record;
            else delete next[record.id];
            return next;
          })}
          aria-label="Select row"
        />
      ),
    },
    { key: "code", title: "Mã linh kiện" },
    { key: "name", title: "Tên linh kiện" },
    { key: "unit", title: "Đơn vị" },
    {
      key: "stockQuantity",
      title: "Tồn kho",
      render: (val: number, record: Part) => (
        <Badge variant={val <= record.minQuantity ? "destructive" : "default"}>{val}</Badge>
      ),
    },
    { key: "minQuantity", title: "Tối thiểu" },
    {
      key: "description",
      title: "Mô tả",
      render: (val: string) => val || "—",
    },
  ];

  const columns = isAdmin
    ? [
        ...baseColumns,
        {
          key: "actions",
      title: "Thao tác",
      render: (_: any, record: Part) => (
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
                <AlertDialogTitle>Xoá linh kiện</AlertDialogTitle>
                <AlertDialogDescription>Bạn có chắc muốn xoá linh kiện "{record.name}"?</AlertDialogDescription>
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
  ] : baseColumns;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Danh mục Linh kiện</h1>
          {isAdmin && (
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm linh kiện
            </Button>
          )}
          {!isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRequestModalState({ open: true, type: "export" })}>
                Yêu cầu xuất linh kiện
              </Button>
              <Button variant="outline" onClick={() => setRequestModalState({ open: true, type: "import" })}>
                Yêu cầu trả linh kiện
              </Button>
            </div>
          )}
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm mã linh kiện, tên, mô tả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 bg-background w-full h-10"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-background w-full md:w-48 h-10">
                <SelectValue placeholder="Trạng thái tồn kho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="in_stock">Còn hàng</SelectItem>
                <SelectItem value="out_of_stock">Hết hàng</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-background w-full md:w-48 h-10">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Ngày thêm</SelectItem>
                  <SelectItem value="code">Mã linh kiện</SelectItem>
                  <SelectItem value="name">Tên linh kiện</SelectItem>
                  <SelectItem value="stockQuantity">Tồn kho</SelectItem>
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

      <PartFormModal open={isModalOpen} onClose={handleClose} part={selectedPart} />
      
      <RequestPartActionModal
        open={requestModalState.open}
        onClose={() => {
          setRequestModalState({ open: false, type: null });
          setRowSelection({});
        }}
        actionType={requestModalState.type}
        initialSelectedParts={Object.values(rowSelection)}
      />
    </div>
  );
};

export default PartListPage;
