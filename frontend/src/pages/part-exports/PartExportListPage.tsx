import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPartExports } from '@/services/part.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import type { PartExport } from '@/types/part.type'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import { useAuthStore } from '@/stores/auth.store'
import PartExportFormModal from './PartExportFormModal'

const PartExportListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { page, pageSize, setPage, setPageSize } = usePagination()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  const { data, isLoading } = useQuery({
    queryKey: ['part-exports', page, pageSize],
    queryFn: () => getPartExports(page, pageSize),
  })

  const columns = [
    { key: 'exportCode', title: 'Mã phiếu xuất' },
    {
      key: 'maintenanceRequest',
      title: 'Phiếu bảo trì',
      render: (_: any, record: PartExport) => `#${record.maintenanceRequest.id}`
    },
    {
      key: 'exportDate',
      title: 'Ngày xuất',
      render: (val: string) => formatDate(val)
    },
    {
      key: 'details',
      title: 'Chi phí',
      render: (_: any, record: PartExport) => {
        const total = record.details.reduce((sum, d) =>
          sum + Number(d.unitPrice) * d.quantity, 0
        )
        return formatCurrency(total)
      }
    },
    {
      key: 'user',
      title: 'Người xuất',
      render: (_: any, record: PartExport) => record.user.username
    },
    {
      key: 'note',
      title: 'Ghi chú',
      render: (val: string) => val || '—'
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Phiếu Xuất kho</h1>
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

      <PartExportFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default PartExportListPage