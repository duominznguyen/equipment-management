import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkOrder, updateWorkOrder } from "@/services/work-order.service";
import { getTechnicians } from "@/services/technician.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
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
  }; // Dùng khi quick create
}

const CreateWorkOrderModal = ({ open, onClose, workOrder, defaultData }: Props) => {
  const queryClient = useQueryClient();
  const isEdit = !!workOrder;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const { data: techniciansData } = useQuery({
    queryKey: ["technicians-all"],
    queryFn: () => getTechnicians(1, 100),
  });

  useEffect(() => {
    if (workOrder) {
      reset({
        technicianId: String(workOrder.technicianId),
        workDescription: workOrder.workDescription || "",
      });
    } else if (defaultData) {
      reset({
        technicianId: "",
        workDescription: defaultData.referenceInfo || "",
      });
    } else {
      reset({ technicianId: "", workDescription: "" });
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
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa Work Order" : "Tạo Work Order"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEdit && defaultData && (
             <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm border border-blue-100">
               {defaultData.ticketId && `Đang tạo Work Order cho Ticket #${defaultData.ticketId}`}
               {defaultData.maintenanceScheduleId && `Đang tạo Work Order cho Lịch bảo trì #${defaultData.maintenanceScheduleId}`}
             </div>
          )}

          <div className="space-y-2">
            <Label>Kỹ thuật viên</Label>
            <Select
              defaultValue={workOrder ? String(workOrder.technicianId) : ""}
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
            <Textarea placeholder="Mô tả công việc cần thực hiện..." rows={3} {...register("workDescription")} />
            {errors.workDescription && <p className="text-sm text-destructive">{errors.workDescription.message as string}</p>}
          </div>

          {error && (
            <p className="text-sm text-destructive">{(error as any)?.response?.data?.message || "Có lỗi xảy ra"}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>Huỷ</Button>
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
