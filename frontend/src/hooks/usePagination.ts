import { useState } from "react";

export const usePagination = (defaultPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const reset = () => setPage(1);

  return { page, pageSize, setPage, setPageSize, reset };
};
