import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePartImport } from "@/services/part.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { PartImport } from "@/types/part.type";

const schema = z.object({
  supplier: z.string().min(1, "Vui lòng nhập nhà cung cấp"),
  note: z.string().optional(),
});

interface Props {
  open: boolean;
  onClose: () => void;
  partImport: PartImport | null;
}

const PartImportEditModal = ({ open, onClose, partImport }: Props) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (partImport) {
      reset({
        supplier: partImport.supplier,
        note: partImport.note || "",
      });
    }
  }, [partImport, reset]);

  const mutation = useMutation({
    mutationFn: (data: any) => updatePartImport(partImport!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["part-imports"] });
      queryClient.invalidateQueries({ queryKey: ["part-import", partImport?.id] });
      onClose();
    },
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Sửa thông tin phiếu nhập PN{partImport?.id.toString().padStart(4, "0")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>Nhà cung cấp</Label>
            <Input placeholder="Tên nhà cung cấp" {...register("supplier")} />
            {errors.supplier && <p className="text-sm text-destructive">{errors.supplier.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Ghi chú (tuỳ chọn)</Label>
            <Input placeholder="Ghi chú..." {...register("note")} />
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as any)?.response?.data?.message || "Có lỗi xảy ra"}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartImportEditModal;
