import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, toggleActiveUser } from "@/services/user.service";
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
import { PlusCircle } from "lucide-react";
import type { User } from "@/types/user.type";
import { formatDate } from "@/utils/date";
import UserFormModal from "./UserFormModal";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  technician: "Kỹ thuật viên",
  customer: "Khách hàng",
};

const roleVariants: Record<string, "default" | "secondary" | "outline"> = {
  admin: "default",
  technician: "secondary",
  customer: "outline",
};

const UserListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { page, pageSize, setPage, setPageSize } = usePagination();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: () => getUsers(page, pageSize),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleActiveUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const columns = [
    {
      key: "username",
      title: "Username",
    },
    {
      key: "email",
      title: "Email",
    },
    {
      key: "fullName",
      title: "Họ tên",
      render: (_: any, record: User) => record.customer?.fullName || record.technician?.fullName || "—",
    },
    {
      key: "role",
      title: "Vai trò",
      render: (val: string) => <Badge variant={roleVariants[val]}>{roleLabels[val]}</Badge>,
    },
    {
      key: "isActive",
      title: "Trạng thái",
      render: (val: boolean) => (
        <Badge variant={val ? "default" : "destructive"}>{val ? "Hoạt động" : "Đã khoá"}</Badge>
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
      render: (_: any, record: User) => (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" variant={record.isActive ? "destructive" : "outline"}>
              {record.isActive ? "Khoá" : "Mở"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận</AlertDialogTitle>
              <AlertDialogDescription>
                {record.isActive
                  ? `Bạn có chắc muốn khoá tài khoản "${record.username}"?`
                  : `Bạn có chắc muốn mở tài khoản "${record.username}"?`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Huỷ</AlertDialogCancel>
              <AlertDialogAction onClick={() => toggleMutation.mutate(record.id)}>Xác nhận</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm tài khoản
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

      <UserFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default UserListPage;
