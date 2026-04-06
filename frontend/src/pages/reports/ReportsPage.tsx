import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMaintenanceReport, getPartsCostReport } from "@/services/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { formatCurrency } from "@/utils/format";
import { formatDate } from "@/utils/date";

const ReportsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ["maintenance-report", filterStart, filterEnd],
    queryFn: () => getMaintenanceReport(filterStart || undefined, filterEnd || undefined),
  });

  const { data: partsData, isLoading: partsLoading } = useQuery({
    queryKey: ["parts-cost-report", filterStart, filterEnd],
    queryFn: () => getPartsCostReport(filterStart || undefined, filterEnd || undefined),
  });

  const handleFilter = () => {
    setFilterStart(startDate);
    setFilterEnd(endDate);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setFilterStart("");
    setFilterEnd("");
  };

  const maintenanceColumns = [
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: any) => record.device?.name || "—",
    },
    {
      key: "technician",
      title: "Kỹ thuật viên",
      render: (_: any, record: any) => record.technician?.fullName || "—",
    },
    {
      key: "type",
      title: "Loại",
      render: (val: string) => (val === "repair" ? "Sửa chữa" : "Định kỳ"),
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => {
        const variants: Record<string, any> = {
          pending: "destructive",
          processing: "default",
          completed: "secondary",
        };
        const labels: Record<string, string> = {
          pending: "Chờ xử lý",
          processing: "Đang xử lý",
          completed: "Hoàn thành",
        };
        return <Badge variant={variants[val]}>{labels[val]}</Badge>;
      },
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDate(val),
    },
  ];

  const partsColumns = [
    { key: "name", title: "Tên linh kiện" },
    { key: "quantity", title: "Số lượng dùng" },
    {
      key: "totalCost",
      title: "Chi phí",
      render: (val: number) => formatCurrency(val),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Báo cáo & Thống kê</h1>

      {/* Bộ lọc */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lọc theo thời gian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Button onClick={handleFilter}>Lọc</Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Thống kê bảo trì */}
      <Card>
        <CardHeader>
          <CardTitle>Thống kê Bảo trì</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{maintenanceData?.summary?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Tổng phiếu</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-destructive">{maintenanceData?.summary?.pending || 0}</div>
              <div className="text-sm text-muted-foreground">Chờ xử lý</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{maintenanceData?.summary?.processing || 0}</div>
              <div className="text-sm text-muted-foreground">Đang xử lý</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">{maintenanceData?.summary?.completed || 0}</div>
              <div className="text-sm text-muted-foreground">Hoàn thành</div>
            </div>
          </div>

          <h3 className="font-medium">10 phiếu bảo trì gần nhất</h3>
          <DataTable
            columns={maintenanceColumns}
            data={maintenanceData?.recentRequests || []}
            total={maintenanceData?.recentRequests?.length || 0}
            page={1}
            pageSize={10}
            loading={maintenanceLoading}
            onPageChange={() => {}}
          />
        </CardContent>
      </Card>

      {/* Chi phí linh kiện */}
      <Card>
        <CardHeader>
          <CardTitle>Chi phí Linh kiện</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{formatCurrency(partsData?.totalCost || 0)}</div>
              <div className="text-sm text-muted-foreground">Tổng chi phí</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{partsData?.totalExports || 0}</div>
              <div className="text-sm text-muted-foreground">Số phiếu xuất</div>
            </div>
          </div>

          <h3 className="font-medium">Chi tiết theo linh kiện</h3>
          <DataTable
            columns={partsColumns}
            data={partsData?.partUsage || []}
            total={partsData?.partUsage?.length || 0}
            page={1}
            pageSize={10}
            loading={partsLoading}
            onPageChange={() => {}}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
