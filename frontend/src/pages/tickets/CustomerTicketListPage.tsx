import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyTickets } from "@/services/ticket.service";
import { DataTable } from "@/components/DataTable";
import { usePagination } from "@/hooks/usePagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import type { Ticket } from "@/types/ticket.type";
import { formatDateTime } from "@/utils/date";
import TicketFormModal from "./TicketFormModal";

const priorityLabels: Record<string, string> = {
  low: "Thấp",
  medium: "Trung bình",
  high: "Cao",
};
const priorityVariants: Record<string, "default" | "secondary" | "destructive"> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};
const statusLabels: Record<string, string> = {
  pending: "Chờ xử lý",
  processing: "Đang xử lý",
  resolved: "Đã giải quyết",
  closed: "Đã đóng",
};
const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "destructive",
  processing: "default",
  resolved: "secondary",
  closed: "outline",
};

const CustomerTicketListPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { page, pageSize, setPage, setPageSize } = usePagination();

  const { data, isLoading } = useQuery({
    queryKey: ["my-tickets", page, pageSize],
    queryFn: () => getMyTickets(page, pageSize),
  });

  const columns = [
    { key: "title", title: "Tiêu đề" },
    {
      key: "device",
      title: "Thiết bị",
      render: (_: any, record: Ticket) => record.device.name,
    },
    {
      key: "priority",
      title: "Ưu tiên",
      render: (val: string) => <Badge variant={priorityVariants[val]}>{priorityLabels[val]}</Badge>,
    },
    {
      key: "status",
      title: "Trạng thái",
      render: (val: string) => <Badge variant={statusVariants[val]}>{statusLabels[val]}</Badge>,
    },
    {
      key: "createdAt",
      title: "Ngày tạo",
      render: (val: string) => formatDateTime(val),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ticket sự cố của tôi</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo ticket
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

      <TicketFormModal open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default CustomerTicketListPage;
