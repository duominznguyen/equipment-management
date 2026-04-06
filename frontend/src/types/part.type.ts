export interface Part {
  id: number;
  name: string;
  code: string;
  unit: string;
  stockQuantity: number;
  minQuantity: number;
  description?: string | null;
}

export interface PaginatedParts {
  data: Part[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PartImport {
  id: number;
  importCode: string;
  importedBy: number;
  supplier: string;
  importDate: string;
  totalCost: number;
  note?: string | null;
  user: { id: number; username: string };
  details: PartImportDetail[];
}

export interface PartImportDetail {
  id: number;
  importId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  part: Part;
}

export interface PartExport {
  id: number;
  exportCode: string;
  maintenanceRequestId: number;
  exportedBy: number;
  exportDate: string;
  note?: string | null;
  user: { id: number; username: string };
  maintenanceRequest: { id: number; description: string };
  details: PartExportDetail[];
}

export interface PartExportDetail {
  id: number;
  exportId: number;
  partId: number;
  quantity: number;
  unitPrice: number;
  part: Part;
}
