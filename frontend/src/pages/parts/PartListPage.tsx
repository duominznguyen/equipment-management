import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getParts, deletePart } from "@/services/part.service";
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
import type { Part } from "@/types/part.type";
import PartFormModal from "./PartFormModal";

const PartListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["parts", page, pageSize],
    queryFn: () => getParts(page, pageSize),
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

  const columns = [
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
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Danh mục Linh kiện</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm linh kiện
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

      <PartFormModal open={isModalOpen} onClose={handleClose} part={selectedPart} />
    </div>
  );
};

export default PartListPage;
