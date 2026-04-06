import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createPartExport, getAllParts } from '@/services/part.service'
import { getMaintenanceRequests } from '@/services/maintenance-request.service'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Loader2, PlusCircle, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

const schema = z.object({
  exportCode: z.string().min(1, 'Vui lòng nhập mã phiếu'),
  maintenanceRequestId: z.string().min(1, 'Vui lòng chọn phiếu bảo trì'),
  exportDate: z.string().min(1, 'Vui lòng chọn ngày xuất'),
  note: z.string().optional(),
})

interface DetailItem {
  partId: string
  quantity: string
  unitPrice: string
}

interface Props {
  open: boolean
  onClose: () => void
}

const PartExportFormModal = ({ open, onClose }: Props) => {
  const queryClient = useQueryClient()
  const [details, setDetails] = useState<DetailItem[]>([
    { partId: '', quantity: '', unitPrice: '' }
  ])

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>({
    resolver: zodResolver(schema)
  })

  const { data: parts = [] } = useQuery({
    queryKey: ['parts-all'],
    queryFn: getAllParts,
  })

  const { data: requestsData } = useQuery({
    queryKey: ['maintenance-requests-all'],
    queryFn: () => getMaintenanceRequests(1, 100),
  })

  const addDetail = () => setDetails([...details, { partId: '', quantity: '', unitPrice: '' }])
  const removeDetail = (index: number) => setDetails(details.filter((_, i) => i !== index))
  const updateDetail = (index: number, field: keyof DetailItem, value: string) => {
    const updated = [...details]
    updated[index][field] = value
    setDetails(updated)
  }

  const totalCost = details.reduce((sum, d) =>
    sum + (Number(d.quantity) || 0) * (Number(d.unitPrice) || 0), 0
  )

  const mutation = useMutation({
    mutationFn: (data: any) => createPartExport({
      ...data,
      maintenanceRequestId: Number(data.maintenanceRequestId),
      details: details.map(d => ({
        partId: Number(d.partId),
        quantity: Number(d.quantity),
        unitPrice: Number(d.unitPrice),
      }))
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      reset()
      setDetails([{ partId: '', quantity: '', unitPrice: '' }])
      onClose()
    }
  })

  const handleClose = () => {
    reset()
    setDetails([{ partId: '', quantity: '', unitPrice: '' }])
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tạo phiếu xuất kho</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mã phiếu xuất</Label>
              <Input placeholder="VD: EXP002" {...register('exportCode')} />
              {errors.exportCode && <p className="text-sm text-destructive">{errors.exportCode.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Ngày xuất</Label>
              <Input type="date" {...register('exportDate')} />
              {errors.exportDate && <p className="text-sm text-destructive">{errors.exportDate.message as string}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Phiếu bảo trì liên quan</Label>
            <Select onValueChange={(val) => setValue('maintenanceRequestId', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn phiếu bảo trì" />
              </SelectTrigger>
              <SelectContent>
                {requestsData?.data?.map((r: any) => (
                  <SelectItem key={r.id} value={String(r.id)}>
                    #{r.id} - {r.device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maintenanceRequestId && <p className="text-sm text-destructive">{errors.maintenanceRequestId.message as string}</p>}
          </div>

          <div className="space-y-2">
            <Label>Ghi chú <span className="text-muted-foreground">(tuỳ chọn)</span></Label>
            <Input placeholder="Ghi chú..." {...register('note')} />
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
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.name} (còn {p.stockQuantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    placeholder="Số lượng"
                    value={detail.quantity}
                    onChange={(e) => updateDetail(index, 'quantity', e.target.value)}
                  />
                  <div className="flex gap-1">
                    <Input
                      type="number"
                      placeholder="Đơn giá"
                      value={detail.unitPrice}
                      onChange={(e) => updateDetail(index, 'unitPrice', e.target.value)}
                    />
                    {details.length > 1 && (
                      <Button type="button" size="icon" variant="destructive" onClick={() => removeDetail(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right text-sm font-medium">
              Tổng tiền: <span className="text-primary">{formatCurrency(totalCost)}</span>
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