import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMaintenanceRequest, updateMaintenanceRequest } from "@/services/maintenance-request.service";
import { getDevices } from "@/services/device.service";
import { getTechnicians } from "@/services/technician.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { MaintenanceRequest } from "@/types/maintenance-request.type";

const createSchema = z.object({
  deviceId: z.string().min(1, "Vui lòng chọn thiết bị"),
  technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
  type: z.string().min(1, "Vui lòng chọn loại bảo trì"),
});

const editSchema = z.object({
  technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  description: z.string().min(1, "Vui lòng nhập mô tả"),
});

interface Props {
  open: boolean;
  onClose: () => void;
  request?: MaintenanceRequest | null;
}

const typeOptions = [
  { value: "repair", label: "Sửa chữa" },
  { value: "periodic", label: "Bảo trì định kỳ" },
];

const MaintenanceRequestFormModal = ({ open, onClose, request }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!request;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  const { data: devicesData } = useQuery({
    queryKey: ["devices-all"],
    queryFn: () => getDevices(1, 100),
  });

  const { data: techniciansData } = useQuery({
    queryKey: ["technicians-all"],
    queryFn: () => getTechnicians(1, 100),
  });

  useEffect(() => {
    if (request) {
      reset({
        technicianId: String(request.technicianId),
        description: request.description,
      });
    } else {
      reset({});
    }
  }, [request, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createMaintenanceRequest({
        ...data,
        deviceId: Number(data.deviceId),
        technicianId: Number(data.technicianId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      updateMaintenanceRequest(request!.id, {
        ...data,
        technicianId: Number(data.technicianId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
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
          <DialogTitle>{isEdit ? "Chỉnh sửa phiếu bảo trì" : "Tạo phiếu bảo trì"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label>Thiết bị</Label>
                <Select onValueChange={(val) => setValue("deviceId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thiết bị" />
                  </SelectTrigger>
                  <SelectContent>
                    {devicesData?.data?.map((d: any) => (
                      <SelectItem key={d.id} value={String(d.id)}>
                        {d.name} - {d.serialNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.deviceId && <p className="text-sm text-destructive">{errors.deviceId.message as string}</p>}
              </div>

              <div className="space-y-2">
                <Label>Loại bảo trì</Label>
                <Select onValueChange={(val) => setValue("type", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type.message as string}</p>}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Kỹ thuật viên</Label>
            <Select
              defaultValue={request ? String(request.technicianId) : ""}
              onValueChange={(val) => setValue("technicianId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn kỹ thuật viên" />
              </SelectTrigger>
              <SelectContent>
                {techniciansData?.data?.map((t: any) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.technicianId && <p className="text-sm text-destructive">{errors.technicianId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả công việc</Label>
            <Textarea placeholder="Mô tả công việc cần thực hiện..." rows={3} {...register("description")} />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message as string}</p>}
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

export default MaintenanceRequestFormModal;
