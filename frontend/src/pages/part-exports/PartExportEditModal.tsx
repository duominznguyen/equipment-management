import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePartExport } from '@/services/part.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const editSchema = z.object({
  reason: z.string().optional(),
})

type EditFormValues = z.infer<typeof editSchema>

interface Props {
  open: boolean
  onClose: () => void
  partExport: { id: number, reason?: string | null } | null
}

const PartExportEditModal = ({ open, onClose, partExport }: Props) => {
  const queryClient = useQueryClient()

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { reason: '' },
  })

  useEffect(() => {
    if (partExport) {
      form.reset({
        reason: partExport.reason || '',
      })
    }
  }, [partExport, form])

  const mutation = useMutation({
    mutationFn: (data: EditFormValues) => updatePartExport(partExport!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      onClose()
    },
  })

  const onSubmit = (data: EditFormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sửa thông tin xuất kho</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do xuất</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập lý do xuất kho..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PartExportEditModal
