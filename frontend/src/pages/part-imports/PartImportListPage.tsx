import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPartImports } from '@/services/part.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Eye, Search, ArrowUp, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { PartImport } from '@/types/part.type'
import { formatDate } from '@/utils/date'
import { formatCurrency } from '@/utils/format'
import PartImportFormModal from './PartImportFormModal'

const PartImportListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { page, pageSize, setPage, setPageSize } = usePagination()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('importDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading } = useQuery({
    queryKey: ['part-imports', page, pageSize, debouncedSearch, startDate, endDate, sortBy, sortOrder],
    queryFn: () => getPartImports(page, pageSize, {
      search: debouncedSearch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
      sortOrder,
    }),
  })

  const columns = [
    { key: 'id', title: 'Mã phiếu nhập', render: (val: number) => `PN${val.toString().padStart(4, '0')}` },
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
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_: any, record: PartImport) => (
        <Button size="sm" variant="outline" onClick={() => navigate(`/part-imports/${record.id}`)} title="Xem chi tiết">
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Phiếu Nhập kho</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo phiếu nhập
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm NCC, ghi chú hoặc ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-background w-full h-10"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Khoảng thời gian (Từ ngày - Đến ngày)</label>
              <div className="flex gap-2 items-center">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-background h-10"
                  title="Từ ngày"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background h-10"
                  title="Đến ngày"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background w-full md:w-48 h-10">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="importDate">Ngày nhập</SelectItem>
                    <SelectItem value="id">Mã phiếu nhập</SelectItem>
                    <SelectItem value="totalCost">Tổng tiền</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="outline" 
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 bg-background h-10"
                  title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
                >
                  {sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
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