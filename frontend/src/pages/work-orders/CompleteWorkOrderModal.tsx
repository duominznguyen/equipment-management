import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { getAllParts } from "@/services/part.service";
import { completeWorkOrder } from "@/services/work-order.service";
import { Trash2, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  workOrderId: number | null;
}

const CompleteWorkOrderModal = ({ open, onClose, workOrderId }: Props) => {
  const queryClient = useQueryClient();
  const [reportContent, setReportContent] = useState("");
  const [selectedParts, setSelectedParts] = useState<{ partId: number; name: string; quantityUsage: number }[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [currentPartId, setCurrentPartId] = useState<number | null>(null);
  const [currentQuantity, setCurrentQuantity] = useState<number>(1);

  const { data: parts } = useQuery({
    queryKey: ["parts-all"],
    queryFn: getAllParts,
  });

  const mutation = useMutation({
    mutationFn: () => {
      if (!workOrderId) throw new Error("Missing workOrderId");
      if (!reportContent.trim()) throw new Error("Vui lòng nhập báo cáo công việc");
      return completeWorkOrder(workOrderId, {
        reportContent,
        parts: selectedParts.map(p => ({ partId: p.partId, quantityUsage: p.quantityUsage }))
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      handleClose();
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || error.message || "Đã xảy ra lỗi");
    }
  });

  const handleClose = () => {
    setReportContent("");
    setSelectedParts([]);
    setCurrentPartId(null);
    setCurrentQuantity(1);
    onClose();
  };

  const addPart = () => {
    if (!currentPartId || currentQuantity <= 0) return;
    const part = parts?.find((p: any) => p.id === currentPartId);
    if (!part) return;

    // Check if already added
    const existing = selectedParts.find(p => p.partId === currentPartId);
    if (existing) {
      setSelectedParts(selectedParts.map(p => 
        p.partId === currentPartId ? { ...p, quantityUsage: p.quantityUsage + currentQuantity } : p
      ));
    } else {
      setSelectedParts([...selectedParts, { partId: currentPartId, name: `[${part.code}] ${part.name}`, quantityUsage: currentQuantity }]);
    }
    
    setCurrentPartId(null);
    setCurrentQuantity(1);
  };

  const removePart = (partId: number) => {
    setSelectedParts(selectedParts.filter(p => p.partId !== partId));
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xác nhận hoàn thành công việc</DialogTitle>
          <DialogDescription>
            Vui lòng điền báo cáo công việc và danh sách linh kiện đã sử dụng (nếu có).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="reportContent">Báo cáo công việc <span className="text-red-500">*</span></Label>
            <Textarea
              id="reportContent"
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
              placeholder="Mô tả chi tiết công việc đã thực hiện, nguyên nhân lỗi, cách khắc phục..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Linh kiện sử dụng</Label>
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
                    <CommandInput placeholder="Tìm kiếm linh kiện..." />
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
                      <th className="px-3 py-2 text-center font-medium w-24">Số lượng</th>
                      <th className="px-3 py-2 text-center font-medium w-16">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedParts.map((p) => (
                      <tr key={p.partId} className="border-t">
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2 text-center">{p.quantityUsage}</td>
                        <td className="px-3 py-2 text-center">
                          <Button variant="ghost" size="sm" onClick={() => removePart(p.partId)} className="h-8 w-8 p-0 text-destructive">
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={mutation.isPending || !reportContent.trim()}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {mutation.isPending ? "Đang lưu..." : "Hoàn thành công việc"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hoàn thành</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn hoàn thành Work Order này không? Xin hãy kiểm tra kỹ Báo cáo công việc và danh sách linh kiện. Thao tác này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Xem lại</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => mutation.mutate()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteWorkOrderModal;
