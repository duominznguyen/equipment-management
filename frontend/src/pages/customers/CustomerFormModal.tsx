import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer, updateCustomer } from "@/services/customer.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Customer } from "@/types/customer.type";

const createSchema = z.object({
  username: z.string().min(3, "Tối thiểu 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Tối thiểu 6 ký tự"),
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  companyName: z.string().optional(),
});

const editSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  address: z.string().min(1, "Vui lòng nhập địa chỉ"),
  companyName: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

const CustomerFormModal = ({ open, onClose, customer }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName,
        phone: customer.phone,
        address: customer.address,
        companyName: customer.companyName || "",
      });
    } else {
      reset({});
    }
  }, [customer, reset]);

  const createMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EditForm) => updateCustomer(customer!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      onClose();
    },
  });

  const onSubmit = (data: any) => {
    if (isEdit) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <>
              <p className="text-sm font-medium text-muted-foreground">Thông tin tài khoản</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="Nhập username" {...register("username")} />
                  {errors.username && <p className="text-sm text-destructive">{errors.username.message as string}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input placeholder="Nhập email" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message as string}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mật khẩu</Label>
                <Input type="password" placeholder="Nhập mật khẩu" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message as string}</p>}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Thông tin khách hàng</p>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Họ tên</Label>
              <Input placeholder="Nhập họ tên" {...register("fullName")} />
              {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Số điện thoại</Label>
              <Input placeholder="Nhập SĐT" {...register("phone")} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Địa chỉ</Label>
            <Input placeholder="Nhập địa chỉ" {...register("address")} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Công ty <span className="text-muted-foreground">(tuỳ chọn)</span>
            </Label>
            <Input placeholder="Nhập tên công ty" {...register("companyName")} />
          </div>

          {error && (
            <p className="text-sm text-destructive">{(error as any)?.response?.data?.message || "Có lỗi xảy ra"}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Lưu" : "Tạo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerFormModal;
