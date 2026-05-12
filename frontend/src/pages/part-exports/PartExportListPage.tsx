import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPartExports } from '@/services/part.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import type { PartExport } from '@/types/part.type'
import { formatDateTime } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import PartExportFormModal from './PartExportFormModal'

const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  approved: "Đã duyệt",
  completed: "Hoàn thành",
  cancelled: "Đã hủy"
};

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "destructive",
  approved: "secondary",
  completed: "default",
  cancelled: "outline"
};

const PartExportListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { page, pageSize, setPage, setPageSize } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['part-exports', page, pageSize],
    queryFn: () => getPartExports(page, pageSize),
  })

  const columns = [
    { key: 'id', title: 'Mã phiếu', render: (val: number) => `#${val}` },
    {
      key: 'technician',
      title: 'Người xuất',
      render: (_: any, record: PartExport) => record.technician?.fullName || '—'
    },
    {
      key: 'details',
      title: 'SL Chi tiết',
      render: (_: any, record: PartExport) => `${record.details?.length || 0} mục`
    },
    {
      key: 'exportDate',
      title: 'Ngày xuất',
      render: (val: string) => formatDateTime(val)
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (val: string) => <Badge variant={statusVariants[val] || "outline"}>{statusLabels[val] || val}</Badge>
    },
    {
      key: 'reason',
      title: 'Lý do',
      render: (val: string) => val || '—'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lịch sử Xuất kho</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo phiếu xuất
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.total || 0}
        page={page}
        pageSize={pageSize}
        loading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />

      {isModalOpen && (
        <PartExportFormModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}

export default PartExportListPage