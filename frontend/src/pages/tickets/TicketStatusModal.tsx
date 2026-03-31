import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTicketStatus } from "@/services/ticket.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Ticket } from "@/types/ticket.type";

const statusOptions = [
  { value: "pending", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "resolved", label: "Đã giải quyết" },
  { value: "closed", label: "Đã đóng" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  queryKey: string;
}

const TicketStatusModal = ({ open, onClose, ticket, queryKey }: Props) => {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>(ticket?.status || "pending");

  const mutation = useMutation({
    mutationFn: () => updateTicketStatus(ticket!.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      onClose();
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái ticket</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Ticket</Label>
            <p className="text-sm text-muted-foreground">{ticket?.title}</p>
          </div>

          <div className="space-y-2">
            <Label>Trạng thái mới</Label>
            <Select defaultValue={ticket?.status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Cập nhật
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TicketStatusModal;
