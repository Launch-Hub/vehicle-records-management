import { useCallback, useEffect, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/list-view/table';
import { logsService, type ActivityLog } from '@/lib/services/logs';
import type { PaginationProps } from '@/lib/types/props';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const columns: ColumnDef<ActivityLog>[] = [
  {
    accessorKey: 'userId',
    header: () => <div>Người dùng</div>,
    cell: (info) => {
      const user = info.getValue() as ActivityLog['userId'];
      return (
        <div>
          <div className="font-medium">{user.fullName}</div>
          <div className="text-sm text-muted-foreground">@{user.username}</div>
        </div>
      );
    },
    minSize: 180,
  },
  {
    accessorKey: 'description',
    header: () => <div>Hành động</div>,
    cell: (info) => <span className="text-muted-foreground">{info.getValue() as string}</span>,
    minSize: 200,
  },
  {
    accessorKey: 'createdAt',
    header: () => <div>Thời gian</div>,
    cell: (info) => (
      <span className="text-muted-foreground">
        {format(new Date(info.getValue() as string), 'dd/MM/yyyy HH:mm:ss', { locale: vi })}
      </span>
    ),
    minSize: 160,
  },
];

export default function LogsPage() {
  const [isFetching, setIsFetching] = useState(false);
  const [total, setTotal] = useState(0);
  const [data, setData] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<PaginationProps>({ pageIndex: 0, pageSize: 10 });
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await logsService.getList({
        pageIndex: pagination.pageIndex + 1, // API is 1-based
        pageSize: pagination.pageSize,
        search: search || undefined,
        resource: 'procedures',
      });
      setTotal(response.total);
      setData(response.items);
    } catch (error) {
      // Optionally add toast error
      setData([]);
      setTotal(0);
    } finally {
      setIsFetching(false);
    }
  }, [pagination, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleChangePage = (newPagination: PaginationProps) => {
    setPagination(newPagination);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable
            loading={isFetching}
            total={total}
            data={data}
            columns={columns}
            onPageChange={handleChangePage}
            onSearch={handleSearch}
            onCreate={() => {}}
            onEdit={() => {}}
            onCopy={() => {}}
            onDelete={() => {}}
          />
        </div>
      </div>
    </div>
  );
} 