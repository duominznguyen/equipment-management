import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWarrantyContract, updateWarrantyContract } from "@/services/warranty-contract.service";
import { getCustomers } from "@/services/customer.service";
import { getDevices } from "@/services/device.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { WarrantyContract } from "@/types/warranty-contract.type";

const createSchema = z.object({
  contractNumber: z.string().min(1, "Vui lòng nhập mã hợp đồng"),
  deviceId: z.string().min(1, "Vui lòng chọn thiết bị"),
  customerId: z.string().min(1, "Vui lòng chọn khách hàng"),
  startDate: z.string().min(1, "Vui lòng nhập ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng nhập ngày kết thúc"),
  terms: z.string().optional(),
});

const editSchema = z.object({
  startDate: z.string().min(1, "Vui lòng nhập ngày bắt đầu"),
  endDate: z.string().min(1, "Vui lòng nhập ngày kết thúc"),
  terms: z.string().optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  contract?: WarrantyContract | null;
}

const WarrantyContractFormModal = ({ open, onClose, contract }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!contract;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers-all"],
    queryFn: () => getCustomers(1, 100),
  });

  const { data: devicesData } = useQuery({
    queryKey: ["devices-all"],
    queryFn: () => getDevices(1, 100),
  });

  useEffect(() => {
    if (contract) {
      reset({
        startDate: contract.startDate.split("T")[0],
        endDate: contract.endDate.split("T")[0],
        terms: contract.terms || "",
      });
    } else {
      reset({});
    }
  }, [contract, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createWarrantyContract({
        ...data,
        deviceId: Number(data.deviceId),
        customerId: Number(data.customerId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranty-contracts"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateWarrantyContract(contract!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["warranty-contracts"] });
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
          <DialogTitle>{isEdit ? "Chỉnh sửa hợp đồng" : "Thêm hợp đồng bảo hành"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label>Mã hợp đồng</Label>
                <Input placeholder="VD: WC004" {...register("contractNumber")} />
                {errors.contractNumber && (
                  <p className="text-sm text-destructive">{errors.contractNumber.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  {errors.customerId && (
                    <p className="text-sm text-destructive">{errors.customerId.message as string}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Thiết bị</Label>
                  <Select onValueChange={(val) => setValue("deviceId", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn thiết bị" />
                    </SelectTrigger>
                    <SelectContent>
                      {devicesData?.data?.map((d: any) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.deviceId && <p className="text-sm text-destructive">{errors.deviceId.message as string}</p>}
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ngày bắt đầu</Label>
              <Input type="date" {...register("startDate")} />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ngày kết thúc</Label>
              <Input type="date" {...register("endDate")} />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Điều khoản <span className="text-muted-foreground">(tuỳ chọn)</span>
            </Label>
            <Textarea placeholder="Nhập điều khoản hợp đồng..." {...register("terms")} rows={3} />
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

export default WarrantyContractFormModal;
