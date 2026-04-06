import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPart, updatePart } from '@/services/part.service'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { Part } from '@/types/part.type'

const createSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên linh kiện'),
  code: z.string().min(1, 'Vui lòng nhập mã linh kiện'),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị'),
  stockQuantity: z.string().optional(),
  minQuantity: z.string().optional(),
  description: z.string().optional(),
})

const editSchema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên linh kiện'),
  unit: z.string().min(1, 'Vui lòng nhập đơn vị'),
  minQuantity: z.string().optional(),
  description: z.string().optional(),
})

interface Props {
  open: boolean
  onClose: () => void
  part?: Part | null
}

const PartFormModal = ({ open, onClose, part }: Props) => {
  const queryClient = useQueryClient()
  const isEdit = !!part

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    resolver: zodResolver(isEdit ? editSchema : createSchema)
  })

  useEffect(() => {
    if (part) {
      reset({
        name: part.name,
        unit: part.unit,
        minQuantity: String(part.minQuantity),
        description: part.description || '',
      })
    } else {
      reset({})
    }
  }, [part, reset])

  const createMutation = useMutation({
    mutationFn: (data: any) => createPart({
      ...data,
      stockQuantity: Number(data.stockQuantity) || 0,
      minQuantity: Number(data.minQuantity) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      reset()
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => updatePart(part!.id, {
      ...data,
      minQuantity: Number(data.minQuantity) || 0,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      onClose()
    }
  })

  const onSubmit = (data: any) => {
    if (isEdit) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa linh kiện' : 'Thêm linh kiện mới'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên linh kiện</Label>
              <Input placeholder="VD: RAM DDR4 8GB" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message as string}</p>}
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label>Mã linh kiện</Label>
                <Input placeholder="VD: RAM-DDR4-8G" {...register('code')} />
                {errors.code && <p className="text-sm text-destructive">{errors.code.message as string}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Đơn vị</Label>
              <Input placeholder="VD: cái, hộp, bộ..." {...register('unit')} />
              {errors.unit && <p className="text-sm text-destructive">{errors.unit.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tồn kho tối thiểu</Label>
              <Input type="number" placeholder="0" {...register('minQuantity')} />
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>Số lượng ban đầu</Label>
              <Input type="number" placeholder="0" {...register('stockQuantity')} />
            </div>
          )}

          <div className="space-y-2">
            <Label>Mô tả <span className="text-muted-foreground">(tuỳ chọn)</span></Label>
            <Input placeholder="Nhập mô tả..." {...register('description')} />
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {(error as any)?.response?.data?.message || 'Có lỗi xảy ra'}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => { reset(); onClose() }}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Lưu' : 'Tạo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PartFormModal