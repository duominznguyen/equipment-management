import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDevice, updateDevice } from "@/services/device.service";
import { getAllDeviceCategories } from "@/services/device-category.service";
import { getCustomers } from "@/services/customer.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Device } from "@/types/device.type";

const schema = z.object({
  categoryId: z.string().min(1, "Vui lòng chọn loại thiết bị"),
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  name: z.string().min(1, "Vui lòng nhập tên thiết bị"),
  brand: z.string().min(1, "Vui lòng nhập hãng sản xuất"),
  model: z.string().min(1, "Vui lòng nhập model"),
  serialNumber: z.string().min(1, "Vui lòng nhập số serial"),
  purchaseDate: z.string().optional(),
  status: z.string().min(1, "Vui lòng chọn trạng thái"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  device?: Device | null;
}

const statusOptions = [
  { value: "active", label: "Đang hoạt động" },
  { value: "maintaining", label: "Đang bảo trì" },
  { value: "broken", label: "Hỏng" },
];

const DeviceFormModal = ({ open, onClose, device }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!device;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["device-categories-all"],
    queryFn: getAllDeviceCategories,
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers-all"],
    queryFn: () => getCustomers(1, 100),
  });

  useEffect(() => {
    if (device) {
      reset({
        categoryId: String(device.categoryId),
        customerId: String(device.customerId),
        name: device.name,
        brand: device.brand,
        model: device.model,
        serialNumber: device.serialNumber,
        purchaseDate: device.purchaseDate ? device.purchaseDate.split("T")[0] : "",
        status: device.status,
      });
    } else {
      reset({
        status: "active",
        categoryId: "",
        customerId: "",
      });
    }
  }, [device, reset]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) =>
      createDevice({
        ...data,
        categoryId: Number(data.categoryId),
        customerId: Number(data.customerId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) =>
      updateDevice(device!.id, {
        ...data,
        categoryId: Number(data.categoryId),
        customerId: Number(data.customerId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["devices"] });
      onClose();
    },
  });

  const onSubmit = (data: FormData) => {
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
          <DialogTitle>{isEdit ? "Chỉnh sửa thiết bị" : "Thêm thiết bị mới"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại thiết bị</Label>
              <Select
                defaultValue={device ? String(device.categoryId) : ""}
                onValueChange={(val) => setValue("categoryId", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>

            {!isEdit && (
              <div className="space-y-2">
                <Label>Khách hàng</Label>
                <Select onValueChange={(val) => setValue("customerId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khách hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {customersData?.data?.map((c: any) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && <p className="text-sm text-destructive">{errors.customerId.message}</p>}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tên thiết bị</Label>
            <Input placeholder="VD: PC Văn phòng A" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Hãng sản xuất</Label>
              <Input placeholder="VD: Dell, HP, Canon..." {...register("brand")} />
              {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Model</Label>
              <Input placeholder="VD: OptiPlex 7090" {...register("model")} />
              {errors.model && <p className="text-sm text-destructive">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Số serial</Label>
              <Input placeholder="Nhập số serial" {...register("serialNumber")} disabled={isEdit} />
              {errors.serialNumber && <p className="text-sm text-destructive">{errors.serialNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>
                Ngày mua <span className="text-muted-foreground">(tuỳ chọn)</span>
              </Label>
              <Input type="date" {...register("purchaseDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select defaultValue={device?.status || "active"} onValueChange={(val) => setValue("status", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-destructive">{errors.status.message}</p>}
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

export default DeviceFormModal;
