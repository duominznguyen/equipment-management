import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPartExports, updatePartExportStatus, deletePartExport } from '@/services/part.service'
import { useAuthStore } from '@/stores/auth.store'
import { DataTable } from '@/components/DataTable'
import { usePagination } from '@/hooks/usePagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Eye, Settings, Edit, Trash2, CheckCircle, XCircle, Search, ArrowUp, ArrowDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { PartExport } from '@/types/part.type'
import { formatDateTime } from '@/utils/date'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import PartExportFormModal from './PartExportFormModal'
import PartExportEditModal from './PartExportEditModal'
import PartExportRejectModal from './PartExportRejectModal'

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
  const { user } = useAuthStore()
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const { page, pageSize, setPage, setPageSize } = usePagination()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Search and Filter States
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [creatorRoleFilter, setCreatorRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('exportDate')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500)
    return () => clearTimeout(timer)
  }, [search])

  // State for modals
  const [editModalData, setEditModalData] = useState<{ id: number, reason?: string | null } | null>(null)
  const [rejectModalId, setRejectModalId] = useState<number | null>(null)
  
  // State for alerts
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  const [approveConfirmId, setApproveConfirmId] = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['part-exports', page, pageSize, debouncedSearch, startDate, endDate, statusFilter, creatorRoleFilter, sortBy, sortOrder],
    queryFn: () => getPartExports(page, pageSize, {
      search: debouncedSearch || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      creatorRole: creatorRoleFilter === 'all' ? undefined : creatorRoleFilter,
      sortBy,
      sortOrder,
    }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updatePartExportStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      setApproveConfirmId(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deletePartExport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['part-exports'] })
      queryClient.invalidateQueries({ queryKey: ['parts'] })
      setDeleteConfirmId(null)
    }
  })

  const columns = [
    { key: 'id', title: 'Mã phiếu', render: (val: number) => `PX${val.toString().padStart(4, '0')}` },
    {
      key: 'technicianId',
      title: 'Mã NV',
      render: (_: any, record: PartExport) => {
        if (record.technicianId) {
          return `TECH${record.technicianId.toString().padStart(4, '0')}`
        }
        if (record.userId) {
          return `ADMIN${record.userId.toString().padStart(4, '0')}`
        }
        return '—'
      }
    },
    {
      key: 'technician',
      title: 'Tên người xuất',
      render: (_: any, record: PartExport) => {
        if (record.technicianId && record.technician) {
          return record.technician.fullName
        }
        if (record.user) {
          return record.user.username
        }
        return '—'
      }
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
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_: any, record: PartExport) => (
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => navigate(user?.role === 'admin' ? `/part-exports/${record.id}` : `/tech/part-exports/${record.id}`)}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
          </Button>

          {user?.role === 'admin' && (
            !record.technicianId ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" title="Xử lý">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditModalData({ id: record.id, reason: record.reason })}>
                    <Edit className="h-4 w-4 mr-2" />
                    Sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteConfirmId(record.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : record.status === 'pending' ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" title="Xử lý">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-green-600 focus:text-green-600" onClick={() => setApproveConfirmId(record.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Chấp nhận
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setRejectModalId(record.id)}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Từ chối
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" variant="outline" disabled title="Không có thao tác">
                <Settings className="h-4 w-4 opacity-50" />
              </Button>
            )
          )}
        </div>
      )
    } as any
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Quản lý Xuất kho</h1>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {user?.role === 'admin' ? 'Tạo phiếu xuất kho trực tiếp' : 'Yêu cầu xuất linh kiện'}
          </Button>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground mb-1 block">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm lý do, người xuất, hoặc mã phiếu..."
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
                  className="bg-background h-10 w-full md:w-auto"
                  title="Từ ngày"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-background h-10 w-full md:w-auto"
                  title="Đến ngày"
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Nguồn tạo</label>
              <Select value={creatorRoleFilter} onValueChange={setCreatorRoleFilter}>
                <SelectTrigger className="bg-background w-full md:w-36 h-10">
                  <SelectValue placeholder="Nguồn tạo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="technician">Kỹ thuật viên</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Trạng thái</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-background w-full md:w-36 h-10">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="completed">Hoàn thành</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-auto">
              <label className="text-xs text-muted-foreground mb-1 block">Sắp xếp theo</label>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-background w-full md:w-40 h-10">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="exportDate">Ngày xuất</SelectItem>
                    <SelectItem value="id">Mã phiếu</SelectItem>
                    <SelectItem value="status">Trạng thái</SelectItem>
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

      {isFormModalOpen && (
        <PartExportFormModal
          open={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
        />
      )}

      {/* Modals for Edit and Reject */}
      <PartExportEditModal
        open={!!editModalData}
        onClose={() => setEditModalData(null)}
        partExport={editModalData}
      />
      <PartExportRejectModal
        open={!!rejectModalId}
        onClose={() => setRejectModalId(null)}
        partExportId={rejectModalId}
      />

      {/* Delete Confirm Alert */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phiếu xuất kho?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa hoàn toàn phiếu xuất kho và hoàn lại số lượng tồn kho. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approve Confirm Alert */}
      <AlertDialog open={!!approveConfirmId} onOpenChange={(open) => !open && setApproveConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận duyệt phiếu xuất?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn duyệt yêu cầu xuất kho này? Số lượng tồn kho sẽ bị trừ đi tương ứng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() => approveConfirmId && statusMutation.mutate({ id: approveConfirmId, status: 'completed' })}
            >
              {statusMutation.isPending ? 'Đang duyệt...' : 'Chấp nhận'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PartExportListPage