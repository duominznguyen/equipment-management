import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createMaintenanceSchedule, updateMaintenanceSchedule } from "@/services/maintenance-schedule.service";
import { getDevices } from "@/services/device.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaintenanceSchedule } from "@/types/maintenance-schedule.type";

const createSchema = z.object({
  deviceId: z.string().min(1, "Vui lòng chọn thiết bị"),
  lastMaintenanceDate: z.string().optional(),
  maintenanceIntervalDays: z.number().min(1, "Chu kỳ bảo trì ít nhất là 1 ngày"),
  leadTimeDays: z.number().min(1, "Số ngày báo trước ít nhất là 1"),
  isContinueMaintain: z.boolean().default(true),
});

const editSchema = z.object({
  lastMaintenanceDate: z.string().optional(),
  maintenanceIntervalDays: z.number().min(1, "Chu kỳ bảo trì ít nhất là 1 ngày"),
  leadTimeDays: z.number().min(1, "Số ngày báo trước ít nhất là 1"),
  isContinueMaintain: z.boolean().default(true),
});

interface Props {
  open: boolean;
  onClose: () => void;
  schedule?: MaintenanceSchedule | null;
}

const MaintenanceScheduleFormModal = ({ open, onClose, schedule }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!schedule;
  const [openDevice, setOpenDevice] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      maintenanceIntervalDays: 30,
      leadTimeDays: 7,
      isContinueMaintain: true,
    }
  });

  const { data: devicesData } = useQuery({
    queryKey: ["devices-all"],
    queryFn: () => getDevices(1, 100),
  });

  useEffect(() => {
    if (schedule) {
      reset({
        lastMaintenanceDate: schedule.lastMaintenanceDate ? schedule.lastMaintenanceDate.split("T")[0] : "",
        maintenanceIntervalDays: schedule.maintenanceIntervalDays || 30,
        leadTimeDays: schedule.leadTimeDays,
        isContinueMaintain: schedule.isContinueMaintain,
      });
    } else {
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      
      reset({
        lastMaintenanceDate: `${yyyy}-${mm}-${dd}`,
        maintenanceIntervalDays: 30,
        leadTimeDays: 7,
        isContinueMaintain: true,
      });
    }
  }, [schedule, reset]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createMaintenanceSchedule({
        ...data,
        deviceId: Number(data.deviceId),
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
  const isContinueMaintain = watch("isContinueMaintain");
  const deviceId = watch("deviceId");

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
            <div className="space-y-2 flex flex-col">
              <Label>Thiết bị</Label>
              <Popover open={openDevice} onOpenChange={setOpenDevice} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openDevice}
                    className="w-full justify-between font-normal"
                  >
                    {deviceId 
                      ? (() => {
                          const d = devicesData?.data?.find((x: any) => String(x.id) === String(deviceId));
                          if (d) return `[TB${String(d.id).padStart(4, "0")}] ${d.name}`;
                          return "Chọn thiết bị...";
                        })()
                      : "Chọn thiết bị..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[460px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm mã hoặc tên thiết bị..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy thiết bị nào.</CommandEmpty>
                      <CommandGroup>
                        {devicesData?.data?.map((d: any) => {
                          const deviceCode = `TB${String(d.id).padStart(4, "0")}`;
                          return (
                            <CommandItem
                              key={d.id}
                              value={`${deviceCode} ${d.name} ${d.serialNumber}`}
                              onSelect={() => {
                                setValue("deviceId", String(d.id), { shouldValidate: true });
                                setOpenDevice(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  String(deviceId) === String(d.id) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              [{deviceCode}] {d.name} - S/N: {d.serialNumber}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {errors.deviceId && <p className="text-sm text-destructive">{errors.deviceId.message as string}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Lần bảo trì cuối</Label>
            <Input type="date" {...register("lastMaintenanceDate")} />
          </div>

          <div className="space-y-2">
            <Label>Chu kỳ bảo trì (ngày)</Label>
            <Input 
              type="number" 
              {...register("maintenanceIntervalDays", { valueAsNumber: true })} 
              min={1} 
            />
            {errors.maintenanceIntervalDays && (
              <p className="text-sm text-destructive">{errors.maintenanceIntervalDays.message as string}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Số ngày báo trước</Label>
            <Input 
              type="number" 
              {...register("leadTimeDays", { valueAsNumber: true })} 
              min={1} 
            />
            {errors.leadTimeDays && (
              <p className="text-sm text-destructive">{errors.leadTimeDays.message as string}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="isContinueMaintain" 
              checked={isContinueMaintain}
              onCheckedChange={(checked) => setValue("isContinueMaintain", checked)}
            />
            <Label htmlFor="isContinueMaintain" className="font-normal cursor-pointer">
              Tiếp tục bảo trì định kỳ cho thiết bị này
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive">{(error as any)?.response?.data?.message || "Có lỗi xảy ra"}</p>
          )}

          <DialogFooter className="pt-4">
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
