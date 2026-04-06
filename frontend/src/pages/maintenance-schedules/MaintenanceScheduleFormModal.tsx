import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMaintenanceSchedule, updateMaintenanceSchedule } from "@/services/maintenance-schedule.service";
import { getDevices } from "@/services/device.service";
import { getTechnicians } from "@/services/technician.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { MaintenanceSchedule } from "@/types/maintenance-schedule.type";

const createSchema = z.object({
  deviceId: z.string().min(1, "Vui lòng chọn thiết bị"),
  technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  scheduledDate: z.string().min(1, "Vui lòng chọn ngày bảo trì"),
  description: z.string().optional(),
});

const editSchema = z.object({
  technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  scheduledDate: z.string().min(1, "Vui lòng chọn ngày bảo trì"),
  description: z.string().optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  schedule?: MaintenanceSchedule | null;
}

const MaintenanceScheduleFormModal = ({ open, onClose, schedule }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!schedule;

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
    if (schedule) {
      reset({
        technicianId: String(schedule.technicianId),
        scheduledDate: schedule.scheduledDate.split("T")[0],
        description: schedule.description || "",
      });
    } else {
      reset({});
    }
  }, [schedule, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createMaintenanceSchedule({
        ...data,
        deviceId: Number(data.deviceId),
        technicianId: Number(data.technicianId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      updateMaintenanceSchedule(schedule!.id, {
        ...data,
        technicianId: Number(data.technicianId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
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
          <DialogTitle>{isEdit ? "Chỉnh sửa lịch bảo trì" : "Tạo lịch bảo trì"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && (
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
          )}

          <div className="space-y-2">
            <Label>Kỹ thuật viên</Label>
            <Select
              defaultValue={schedule ? String(schedule.technicianId) : ""}
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
            <Label>Ngày bảo trì</Label>
            <Input type="date" {...register("scheduledDate")} />
            {errors.scheduledDate && (
              <p className="text-sm text-destructive">{errors.scheduledDate.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>
              Mô tả <span className="text-muted-foreground">(tuỳ chọn)</span>
            </Label>
            <Textarea placeholder="Mô tả công việc bảo trì..." rows={3} {...register("description")} />
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

export default MaintenanceScheduleFormModal;
