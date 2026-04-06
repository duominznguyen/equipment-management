import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPartImports } from '@/services/part.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import type { PartImport } from '@/types/part.type'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import PartImportFormModal from './PartImportFormModal'

const PartImportListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { page, pageSize, setPage, setPageSize } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['part-imports', page, pageSize],
    queryFn: () => getPartImports(page, pageSize),
  })

  const columns = [
    { key: 'importCode', title: 'Mã phiếu nhập' },
    { key: 'supplier', title: 'Nhà cung cấp' },
    {
      key: 'importDate',
      title: 'Ngày nhập',
      render: (val: string) => formatDate(val)
    },
    {
      key: 'totalCost',
      title: 'Tổng tiền',
      render: (val: number) => formatCurrency(val)
    },
    {
      key: 'user',
      title: 'Người nhập',
      render: (_: any, record: PartImport) => record.user.username
    },
    {
      key: 'details',
      title: 'Số loại LK',
      render: (_: any, record: PartImport) => `${record.details.length} loại`
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
        <h1 className="text-2xl font-bold">Phiếu Nhập kho</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo phiếu nhập
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

      <PartImportFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

export default PartImportListPage