import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, deleteCustomer } from "@/services/customer.service";
import { DataTable } from "@/components/Datatable";
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
import type { Customer } from "@/types/customer.type";
import { formatDate } from "@/utils/date";
import CustomerFormModal from "./CustomerFormModal";

const CustomerListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", page, pageSize],
    queryFn: () => getCustomers(page, pageSize),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
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
      key: "companyName",
      title: "Công ty",
      render: (val: string) => val || "—",
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (_: any, record: Customer) => (
        <Badge variant={record.user.isActive ? "default" : "destructive"}>
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Khách hàng</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm khách hàng
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

      <CustomerFormModal open={isModalOpen} onClose={handleClose} customer={selectedCustomer} />
    </div>
  );
};

export default CustomerListPage;
