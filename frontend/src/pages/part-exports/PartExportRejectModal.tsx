import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePartExportStatus } from '@/services/part.service'
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

const rejectSchema = z.object({
  rejectReason: z.string().min(1, 'Vui lòng nhập lý do từ chối'),
})

type RejectFormValues = z.infer<typeof rejectSchema>

interface Props {
  open: boolean
  onClose: () => void
  partExportId: number | null
}

const PartExportRejectModal = ({ open, onClose, partExportId }: Props) => {
  const queryClient = useQueryClient()

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { rejectReason: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: RejectFormValues) => updatePartExportStatus(partExportId!, 'cancelled', data.rejectReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      form.reset()
      onClose()
    },
  })

  const onSubmit = (data: RejectFormValues) => {
    if (!partExportId) return
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) { form.reset(); onClose(); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-destructive">Từ chối phiếu xuất kho</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rejectReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lý do từ chối</FormLabel>
                  <FormControl>
                    <Input placeholder="Vui lòng cho biết lý do..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { form.reset(); onClose(); }}>
                Hủy
              </Button>
              <Button type="submit" variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default PartExportRejectModal
