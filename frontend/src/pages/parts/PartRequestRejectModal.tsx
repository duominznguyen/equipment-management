import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePartExportStatus, updatePartImportStatus } from '@/services/part.service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
  request: { id: number; type: 'export' | 'import' } | null
}

const PartRequestRejectModal = ({ open, onClose, request }: Props) => {
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const exportMutation = useMutation({
    mutationFn: ({ id, r }: { id: number, r: string }) => updatePartExportStatus(id, 'cancelled', r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      handleClose()
    }
  })

  const importMutation = useMutation({
    mutationFn: ({ id, r }: { id: number, r: string }) => updatePartImportStatus(id, 'cancelled', r),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-imports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      handleClose()
    }
  })

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const onSubmit = () => {
    if (!reason.trim()) return
    if (!request) return
    
    if (request.type === 'export') {
      exportMutation.mutate({ id: request.id, r: reason })
    } else {
      importMutation.mutate({ id: request.id, r: reason })
    }
  }

  const isPending = exportMutation.isPending || importMutation.isPending

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối yêu cầu {request?.type === 'export' ? 'xuất' : 'trả'} linh kiện</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Lý do từ chối <span className="text-destructive">*</span></Label>
            <Textarea
              placeholder="Nhập lý do từ chối yêu cầu này..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          {(exportMutation.isError || importMutation.isError) && (
            <div className="text-sm text-destructive mt-2">
              Có lỗi xảy ra khi từ chối yêu cầu
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>Hủy</Button>
          <Button 
            variant="destructive" 
            onClick={onSubmit}
            disabled={!reason.trim() || isPending}
          >
            {isPending ? 'Đang xử lý...' : 'Xác nhận từ chối'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PartRequestRejectModal
