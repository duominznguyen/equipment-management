import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getAllParts, createPartExport, createPartImport } from "@/services/part.service";
import { Trash2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Part } from "@/types/part.type";

interface Props {
  open: boolean;
  onClose: () => void;
  actionType: "export" | "import" | null;
  initialSelectedParts: Part[];
}

const RequestPartActionModal = ({ open, onClose, actionType, initialSelectedParts }: Props) => {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [selectedParts, setSelectedParts] = useState<{ part: Part; quantity: number }[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [currentPartId, setCurrentPartId] = useState<number | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);

  const { data: parts } = useQuery({
    queryKey: ["parts-all"],
    queryFn: getAllParts,
  });

  useEffect(() => {
    if (open && initialSelectedParts.length > 0) {
      setSelectedParts(initialSelectedParts.map(p => ({ part: p, quantity: 1 })));
    } else if (open) {
      setSelectedParts([]);
    }
  }, [open, initialSelectedParts]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (selectedParts.length === 0) throw new Error("Vui lòng chọn ít nhất một linh kiện");
      if (!reason.trim()) throw new Error("Vui lòng nhập lý do/ghi chú");

      const details = selectedParts.map(p => ({
        partId: p.part.id,
        quantity: p.quantity,
        unitPrice: 0 // Default for imports (returns) since tech doesn't know price
      }));

      if (actionType === "export") {
        return createPartExport({
          reason,
          details: details.map(d => ({ partId: d.partId, quantity: d.quantity }))
        });
      } else {
        return createPartImport({
          supplier: "Hoàn trả nội bộ (KTV)",
          importDate: new Date().toISOString(),
          note: reason,
          details
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parts"] });
      // Also invalidate exports/imports queries if they exist
      queryClient.invalidateQueries({ queryKey: ["part-exports"] });
      queryClient.invalidateQueries({ queryKey: ["part-imports"] });
      handleClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.message || "Đã xảy ra lỗi");
    }
  });

  const handleClose = () => {
    setReason("");
    setSelectedParts([]);
    setCurrentPartId(null);
    setCurrentQuantity(1);
    onClose();
  };

  const addPart = () => {
    if (!currentPartId || currentQuantity <= 0) return;
    const part = parts?.find((p: any) => p.id === currentPartId);
    if (!part) return;

    const existing = selectedParts.find(p => p.part.id === currentPartId);
    if (existing) {
      setSelectedParts(selectedParts.map(p => 
        p.part.id === currentPartId ? { ...p, quantity: p.quantity + currentQuantity } : p
      ));
    } else {
      setSelectedParts([...selectedParts, { part, quantity: currentQuantity }]);
    }
    
    setCurrentPartId(null);
    setCurrentQuantity(1);
  };

  const removePart = (partId: number) => {
    setSelectedParts(selectedParts.filter(p => p.part.id !== partId));
  };

  if (!actionType) return null;

  const isExport = actionType === "export";
  const title = isExport ? "Yêu cầu xuất linh kiện" : "Yêu cầu trả linh kiện";
  const desc = isExport ? "Tạo phiếu yêu cầu xuất kho linh kiện để sử dụng." : "Tạo phiếu yêu cầu hoàn trả linh kiện thừa về kho.";

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{isExport ? "Lý do xuất" : "Ghi chú trả"} <span className="text-red-500">*</span></Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isExport ? "Ví dụ: Xuất linh kiện cho Work Order #123..." : "Ví dụ: Trả lại linh kiện dư từ Work Order #123..."}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Tìm & Thêm linh kiện</Label>
            <div className="flex gap-2 items-start">
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="flex-1 justify-between bg-background"
                  >
                    {currentPartId
                      ? (() => {
                          const p = parts?.find((p: any) => p.id === currentPartId);
                          return p ? `[${p.code}] ${p.name}` : "Chọn linh kiện...";
                        })()
                      : "Chọn linh kiện..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm mã hoặc tên linh kiện..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy linh kiện.</CommandEmpty>
                      <CommandGroup>
                        {parts?.map((part: any) => (
                          <CommandItem
                            key={part.id}
                            value={`${part.code} ${part.name}`}
                            onSelect={() => {
                              setCurrentPartId(part.id);
                              setOpenCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                currentPartId === part.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            [{part.code}] {part.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <Input 
                type="number" 
                value={currentQuantity} 
                onChange={(e) => setCurrentQuantity(Number(e.target.value))}
                className="w-24 bg-background"
                min={1}
                placeholder="SL"
              />

              <Button onClick={addPart} disabled={!currentPartId || currentQuantity <= 0} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedParts.length > 0 && (
              <div className="mt-4 border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Linh kiện</th>
                      <th className="px-3 py-2 text-center font-medium w-32">Số lượng</th>
                      <th className="px-3 py-2 text-center font-medium w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedParts.map((p, idx) => (
                      <tr key={p.part.id} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">[{p.part.code}] {p.part.name}</div>
                          <div className="text-xs text-muted-foreground">Tồn kho hiện tại: {p.part.stockQuantity} {p.part.unit}</div>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Input 
                            type="number" 
                            min={1} 
                            value={p.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const newParts = [...selectedParts];
                              newParts[idx].quantity = val > 0 ? val : 1;
                              setSelectedParts(newParts);
                            }}
                            className="w-20 mx-auto h-8 text-center"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button variant="ghost" size="sm" onClick={() => removePart(p.part.id)} className="h-8 w-8 p-0 text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Hủy</Button>
          <Button 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || selectedParts.length === 0 || !reason.trim()}
          >
            {mutation.isPending ? "Đang xử lý..." : "Gửi yêu cầu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequestPartActionModal;
