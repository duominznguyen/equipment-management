import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { getPartImportById } from "@/services/part.service";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package } from "lucide-react";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/format";
import { DataTable } from "@/components/DataTable";

const PartImportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: partImport, isLoading } = useQuery({
    queryKey: ["part-import", id],
    queryFn: () => getPartImportById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div>Đang tải...</div>;
  if (!partImport) return <div>Không tìm thấy phiếu nhập</div>;

  const detailColumns = [
    {
      key: "part",
      title: "Linh kiện",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.part.name}</div>
          <div className="text-xs text-muted-foreground">{record.part.code}</div>
        </div>
      ),
    },
    { key: "quantity", title: "Số lượng", render: (val: number) => val },
    { key: "unitPrice", title: "Đơn giá", render: (val: number) => formatCurrency(val) },
    {
      key: "total",
      title: "Thành tiền",
      render: (_: any, record: any) => formatCurrency(record.quantity * record.unitPrice),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            Chi tiết Phiếu Nhập: PN{partImport.id.toString().padStart(4, "0")}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Thông tin chung
          </h2>
          <div className="grid grid-cols-2 gap-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nhà cung cấp</p>
              <p className="font-medium">{partImport.supplier}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Người nhập</p>
              <p className="font-medium">{partImport.user?.username}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ngày nhập</p>
              <p className="font-medium">{formatDate(partImport.importDate)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng tiền</p>
              <p className="font-medium text-primary">{formatCurrency(partImport.totalCost)}</p>
            </div>
          </div>
          {partImport.note && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Ghi chú</p>
              <p className="text-sm mt-1">{partImport.note}</p>
            </div>
          )}
        </div>

        <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="font-semibold text-lg mb-4">Chi tiết vật tư</h2>
          <div className="flex-1 overflow-auto">
            <DataTable
              columns={detailColumns}
              data={partImport.details}
              total={partImport.details.length}
              page={1}
              pageSize={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartImportDetailPage;
