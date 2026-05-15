import { useQuery } from '@tanstack/react-query'
import { getMyDevices } from '@/services/device.service'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth.store'
import { formatDate } from '@/utils/date'

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Ngừng HĐ',
  maintaining: 'Bảo trì',
  broken: 'Đang lỗi',
  error: 'Đang lỗi',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  inactive: 'outline',
  maintaining: 'secondary',
  broken: 'destructive',
  error: 'destructive',
}

const MyDevicesPage = () => {
  const { user } = useAuthStore()
  const { page, pageSize, setPage, setPageSize } = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: ['my-devices', user?.profile?.id, page, pageSize],
    queryFn: () => getMyDevices(user?.profile?.id, page, pageSize),
    enabled: !!user?.profile?.id,
  })

  const columns = [
    { key: 'name', title: 'Tên thiết bị' },
    {
      key: 'category',
      title: 'Loại',
      render: (_: any, record: any) => record.category.name
    },
    { key: 'brand', title: 'Hãng' },
    { key: 'model', title: 'Model' },
    { key: 'serialNumber', title: 'Số serial' },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (val: string) => (
        <Badge className="whitespace-nowrap" variant={statusVariants[val] || 'outline'}>{statusLabels[val] || val}</Badge>
      )
    },
    {
      key: 'purchaseDate',
      title: 'Ngày mua',
      render: (val: string) => val ? formatDate(val) : '—'
    },
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thiết bị của tôi</h1>

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

export default MyDevicesPage