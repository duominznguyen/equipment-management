import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWarrantyContracts, deleteWarrantyContract } from "@/services/warranty-contract.service";
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
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["warranty-contracts", page, pageSize],
    queryFn: () => getWarrantyContracts(page, pageSize),
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
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: WarrantyContract) => record.device.name,
    },
    {
      key: "customer",
      title: "Khách hàng",
      render: (_: any, record: WarrantyContract) => record.customer.fullName,
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Hợp đồng Bảo hành</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm hợp đồng
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

      <WarrantyContractFormModal open={isModalOpen} onClose={handleClose} contract={selectedContract} />
    </div>
  );
};

export default WarrantyContractListPage;
