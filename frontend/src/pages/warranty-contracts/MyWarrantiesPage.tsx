import { useQuery } from '@tanstack/react-query'
import { getMyWarrantyContracts } from '@/services/warranty-contract.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/utils/date'

const statusLabels: Record<string, string> = {
  active: 'Còn hạn',
  expiring_soon: 'Sắp hết hạn',
  expired: 'Hết hạn',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  expiring_soon: 'secondary',
  expired: 'destructive',
}

const MyWarrantiesPage = () => {
  const { user } = useAuthStore()
  const { page, pageSize, setPage, setPageSize } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['my-warranties', user?.profile?.id, page, pageSize],
    queryFn: () => getMyWarrantyContracts(user?.profile?.id, page, pageSize),
    enabled: !!user?.profile?.id,
  })

  const columns = [
    { key: 'contractNumber', title: 'Mã hợp đồng' },
    {
      key: 'device',
      title: 'Thiết bị',
      render: (_: any, record: any) => record.device.name
    },
    {
      key: 'serialNumber',
      title: 'Số serial',
      render: (_: any, record: any) => record.device.serialNumber
    },
    {
      key: 'startDate',
      title: 'Ngày bắt đầu',
      render: (val: string) => formatDate(val)
    },
    {
      key: 'endDate',
      title: 'Ngày kết thúc',
      render: (val: string) => formatDate(val)
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (val: string) => (
        <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>
      )
    },
    {
      key: 'terms',
      title: 'Điều khoản',
      render: (val: string) => val
        ? <span className="text-sm text-muted-foreground">{val.substring(0, 50)}...</span>
        : '—'
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Hợp đồng Bảo hành của tôi</h1>

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
    </div>
  )
}

export default MyWarrantiesPage