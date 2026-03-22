export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 10))
  return { page, pageSize }
}

export const paginate = async <T>(
  model: any,
  params: PaginationParams,
  options: {
    where?: any
    include?: any
    orderBy?: any
    select?: any
  } = {}
): Promise<PaginatedResult<T>> => {
  const { page, pageSize } = params
  const skip = (page - 1) * pageSize

  const [data, total] = await Promise.all([
    model.findMany({ ...options, skip, take: pageSize }),
    model.count({ where: options.where }),
  ])

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}