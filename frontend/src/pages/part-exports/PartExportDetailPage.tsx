import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { getPartExportById } from '@/services/part.service'
import { Button } from '@/components/ui/button'
import { ArrowLeft, User, Calendar, FileText, CheckCircle } from 'lucide-react'
import { formatDateTime } from '@/utils/date'
import { Badge } from '@/components/ui/badge'

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

const PartExportDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['part-export', Number(id)],
    queryFn: () => getPartExportById(Number(id)),
  })

  if (isLoading) return <div className="p-8 text-center">Đang tải...</div>
  if (isError || !data) return <div className="p-8 text-center text-destructive">Lỗi khi tải thông tin phiếu xuất</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/part-exports')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Chi tiết phiếu xuất kho #{data.id}</h1>
        <Badge variant={statusVariants[data.status] || "outline"} className="ml-auto text-sm px-3 py-1">
          {statusLabels[data.status] || data.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Thông tin chung</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="w-24">Ngày xuất:</span>
              <span className="font-medium text-foreground">{formatDateTime(data.exportDate)}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="w-24">Người xuất:</span>
              <span className="font-medium text-foreground">
                {data.technicianId && data.technician 
                  ? `TECH${data.technicianId.toString().padStart(4, '0')} - ${data.technician.fullName}`
                  : data.user
                    ? `ADMIN${data.user.id.toString().padStart(4, '0')} - ${data.user.username}`
                    : '—'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="w-24">Trạng thái:</span>
              <span className="font-medium text-foreground">{statusLabels[data.status]}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-lg border-b pb-2">Lý do xuất</h2>
          <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5" />
            <span className="flex-1 font-medium text-foreground">{data.reason || 'Không có lý do'}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h2 className="font-semibold text-lg">Danh sách linh kiện xuất</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">STT</th>
                <th className="px-6 py-3 font-medium">Mã linh kiện</th>
                <th className="px-6 py-3 font-medium">Tên linh kiện</th>
                <th className="px-6 py-3 font-medium">ĐVT</th>
                <th className="px-6 py-3 font-medium text-right">Số lượng</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.details.map((detail: any, index: number) => (
                <tr key={detail.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 font-medium">{detail.part.code}</td>
                  <td className="px-6 py-4">{detail.part.name}</td>
                  <td className="px-6 py-4">{detail.part.unit}</td>
                  <td className="px-6 py-4 text-right font-semibold">{detail.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.details.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">Không có linh kiện nào trong phiếu này</div>
        )}
      </div>
    </div>
  )
}

export default PartExportDetailPage
