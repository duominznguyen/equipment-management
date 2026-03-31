import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTicket } from "@/services/ticket.service";
import { getMyDevices } from "@/services/device.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";

const schema = z.object({
  deviceId: z.string().min(1, "Vui lòng chọn thiết bị"),
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  description: z.string().min(1, "Vui lòng nhập mô tả sự cố"),
  priority: z.string().min(1, "Vui lòng chọn mức độ ưu tiên"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

const priorityOptions = [
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
];

const TicketFormModal = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  const { data: devicesData } = useQuery({
    queryKey: ["my-devices", user?.profile?.id],
    queryFn: () => getMyDevices(user?.profile?.id),
    enabled: !!user?.profile?.id,
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      createTicket({
        ...data,
        deviceId: Number(data.deviceId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
      reset();
      onClose();
    },
  });

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
          <DialogTitle>Tạo ticket sự cố</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>Thiết bị gặp sự cố</Label>
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
            {errors.deviceId && <p className="text-sm text-destructive">{errors.deviceId.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tiêu đề</Label>
            <Input placeholder="Mô tả ngắn gọn sự cố..." {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mô tả chi tiết</Label>
            <Textarea
              placeholder="Mô tả chi tiết sự cố, khi nào xảy ra, triệu chứng..."
              rows={4}
              {...register("description")}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Mức độ ưu tiên</Label>
            <Select defaultValue="medium" onValueChange={(val) => setValue("priority", val)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as any)?.response?.data?.message || "Có lỗi xảy ra"}
            </p>
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
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo ticket
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketFormModal;
