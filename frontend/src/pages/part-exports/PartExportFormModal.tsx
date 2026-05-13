import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPartExport, getAllParts } from '@/services/part.service'
import { getWorkOrders } from '@/services/work-order.service'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'

const schema = z.object({
  exportDate: z.string().min(1, 'Vui lòng chọn ngày xuất'),
  reason: z.string().optional(),
})

interface DetailItem {
  partId: string
  quantity: string
}

interface Props {
  open: boolean
  onClose: () => void
}

const PartExportFormModal = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient()
  const [details, setDetails] = useState<DetailItem[]>([
    { partId: '', quantity: '1' }
  ])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      exportDate: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }
  })

  const { data: parts = [] } = useQuery({
    queryKey: ['parts-all'],
    queryFn: getAllParts,
  })

  const { data: workOrdersData } = useQuery({
    queryKey: ['work-orders-all'],
    queryFn: () => getWorkOrders(1, 100),
  })

  const addDetail = () => setDetails([...details, { partId: '', quantity: '1' }])
  const removeDetail = (index: number) => setDetails(details.filter((_, i) => i !== index))
  const updateDetail = (index: number, field: keyof DetailItem, value: string) => {
    const updated = [...details]
    updated[index][field] = value
    setDetails(updated)
  }

  const mutation = useMutation({
    mutationFn: (data: any) => createPartExport({
      ...data,
      details: details.map(d => ({
        partId: Number(d.partId),
        quantity: Number(d.quantity),
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      reset()
      setDetails([{ partId: '', quantity: '1' }])
      onClose()
    }
  })

  const handleClose = () => {
    reset()
    setDetails([{ partId: '', quantity: '1' }])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo phiếu xuất kho</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Ngày xuất</Label>
              <Input type="datetime-local" {...register('exportDate')} />
              {errors.exportDate && <p className="text-sm text-destructive">{errors.exportDate.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Lý do xuất kho</Label>
            <Textarea placeholder="Lý do xuất..." {...register('reason')} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Chi tiết linh kiện xuất</Label>
              <Button type="button" size="sm" variant="outline" onClick={addDetail}>
                <PlusCircle className="h-3 w-3 mr-1" /> Thêm
              </Button>
            </div>

            <div className="space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="grid grid-cols-4 gap-2 items-end">
                  <div className="col-span-2">
                    <Select
                      value={detail.partId}
                      onValueChange={(val) => updateDetail(index, 'partId', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn linh kiện" />
                      </SelectTrigger>
                      <SelectContent>
                        {parts.map((p: any) => (
                          <SelectItem key={p.id} value={String(p.id)} disabled={p.stockQuantity <= 0}>
                            {p.name} (còn {p.stockQuantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Số lượng"
                    value={detail.quantity}
                    onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                  />
                  <div className="flex justify-end">
                    {details.length > 1 && (
                      <Button type="button" size="icon" variant="destructive" onClick={() => removeDetail(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {mutation.isError && (
            <p className="text-sm text-destructive">
              {(mutation.error as any)?.response?.data?.message || 'Có lỗi xảy ra'}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Huỷ</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo phiếu xuất
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PartExportFormModal