import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTechnicians } from "@/services/technician.service";
import { createWorkOrder, updateWorkOrder } from "@/services/work-order.service";
import { getAllDeviceCategories } from "@/services/device-category.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkOrder } from "@/types/work-order.type";

const schema = z.object({
  technicianId: z.string().min(1, "Vui lòng chọn kỹ thuật viên"),
  workDescription: z.string().optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  workOrder?: WorkOrder | null; // Dùng khi edit
  defaultData?: {
    ticketId?: number;
    maintenanceScheduleId?: number;
    referenceInfo?: string;
    deviceCategoryId?: number;
  }; // Dùng khi quick create
}

const CreateWorkOrderModal = ({ open, onClose, workOrder, defaultData }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!workOrder;
  const [openCombobox, setOpenCombobox] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const selectedTechnicianId = watch("technicianId");

  const { data: deviceCategories } = useQuery({
    queryKey: ["device-categories-all"],
    queryFn: getAllDeviceCategories,
  });

  const { data: techniciansData } = useQuery({
    queryKey: ["technicians-all", selectedSkillIds],
    queryFn: () =>
      getTechnicians(1, 100, { skillIds: selectedSkillIds.length > 0 ? selectedSkillIds.join(",") : undefined }),
  });

  useEffect(() => {
    if (workOrder) {
      reset({
        technicianId: String(workOrder.technicianId),
        workDescription: workOrder.workDescription || "",
      });
      setSelectedSkillIds([]);
    } else if (defaultData) {
      reset({
        technicianId: "",
        workDescription: defaultData.referenceInfo || "",
      });
      setSelectedSkillIds(defaultData.deviceCategoryId ? [defaultData.deviceCategoryId] : []);
    } else {
      reset({ technicianId: "", workDescription: "" });
      setSelectedSkillIds([]);
    }
  }, [workOrder, defaultData, reset, open]);

  const createMutation = useMutation({
    mutationFn: (data: any) =>
      createWorkOrder({
        technicianId: Number(data.technicianId),
        workDescription: data.workDescription,
        ticketId: defaultData?.ticketId,
        maintenanceScheduleId: defaultData?.maintenanceScheduleId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      if (defaultData?.ticketId) queryClient.invalidateQueries({ queryKey: ["tickets"] });
      if (defaultData?.maintenanceScheduleId) queryClient.invalidateQueries({ queryKey: ["maintenance-schedules"] });
      reset();
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) =>
      updateWorkOrder(workOrder!.id, {
        technicianId: Number(data.technicianId),
        workDescription: data.workDescription,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
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
          <DialogTitle>{isEdit ? "Chỉnh sửa Work Order" : "Tạo Work Order"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && defaultData && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm border border-blue-100">
              {defaultData.ticketId && `Đang tạo Work Order cho Ticket #${defaultData.ticketId}`}
              {defaultData.maintenanceScheduleId &&
                `Đang tạo Work Order cho Lịch bảo trì #${defaultData.maintenanceScheduleId}`}
            </div>
          )}

          <div className="space-y-2">
            <Label>Lọc Kỹ thuật viên theo kỹ năng</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between h-auto py-2 px-3">
                  {selectedSkillIds.length === 0 ? "Tất cả kỹ năng" : `Đã chọn ${selectedSkillIds.length} kỹ năng`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Tìm kỹ năng..." />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy kỹ năng phù hợp.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setSelectedSkillIds([]);
                          setValue("technicianId", "");
                        }}
                        className="font-medium text-primary"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 flex-shrink-0",
                            selectedSkillIds.length === 0 ? "opacity-100" : "opacity-0",
                          )}
                        />
                        Tất cả (Không lọc)
                      </CommandItem>
                      {deviceCategories?.map((cat: any) => {
                        const isSelected = selectedSkillIds.includes(cat.id);
                        return (
                          <CommandItem
                            key={cat.id}
                            onSelect={() => {
                              setSelectedSkillIds((prev) =>
                                isSelected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id],
                              );
                              // Reset technician choice if filters change
                              setValue("technicianId", "");
                            }}
                          >
                            <Check
                              className={cn("mr-2 h-4 w-4 flex-shrink-0", isSelected ? "opacity-100" : "opacity-0")}
                            />
                            {cat.name}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Kỹ thuật viên</Label>
            <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCombobox}
                  className="w-full justify-between h-auto py-2 px-3"
                >
                  {selectedTechnicianId && techniciansData?.data
                    ? (() => {
                        const t = techniciansData.data.find((x: any) => String(x.id) === selectedTechnicianId);
                        return t ? `KTV${String(t.id).padStart(4, "0")} - ${t.fullName}` : "Chọn kỹ thuật viên...";
                      })()
                    : "Chọn kỹ thuật viên..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[450px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Tìm theo tên, mã KTV" />
                  <CommandList>
                    <CommandEmpty>Không tìm thấy nhân viên phù hợp.</CommandEmpty>
                    <CommandGroup>
                      {techniciansData?.data?.map((t: any) => (
                        <CommandItem
                          key={t.id}
                          value={`KTV${String(t.id).padStart(4, "0")} ${t.fullName}`}
                          onSelect={() => {
                            setValue("technicianId", String(t.id));
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 flex-shrink-0",
                              selectedTechnicianId === String(t.id) ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="font-medium">
                            KTV{String(t.id).padStart(4, "0")} - {t.fullName}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.technicianId && <p className="text-sm text-destructive">{errors.technicianId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả công việc</Label>
            <Textarea placeholder="Mô tả công việc cần thực hiện..." rows={3} {...register("workDescription")} />
            {errors.workDescription && (
              <p className="text-sm text-destructive">{errors.workDescription.message as string}</p>
            )}
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

export default CreateWorkOrderModal;
