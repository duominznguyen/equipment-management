import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createDeviceCategory, updateDeviceCategory } from '@/services/device-category.service'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { DeviceCategory } from '@/types/device-category.type'

const schema = z.object({
  name: z.string().min(1, 'Vui lòng nhập tên loại thiết bị'),
  description: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  category?: DeviceCategory | null
}

const DeviceCategoryFormModal = ({ open, onClose, category }: Props) => {
  const queryClient = useQueryClient()
  const isEdit = !!category

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  })

  useEffect(() => {
    if (category) {
      reset({ name: category.name, description: category.description || '' })
    } else {
      reset({ name: '', description: '' })
    }
  }, [category, reset])

  const createMutation = useMutation({
    mutationFn: createDeviceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] })
      reset()
      onClose()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => updateDeviceCategory(category!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['device-categories'] })
      onClose()
    }
  })

  const onSubmit = (data: FormData) => {
    if (isEdit) updateMutation.mutate(data)
    else createMutation.mutate(data)
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Chỉnh sửa loại thiết bị' : 'Thêm loại thiết bị'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Tên loại thiết bị</Label>
            <Input placeholder="VD: Máy tính, Laptop, Máy in..." {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

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

export default DeviceCategoryFormModal