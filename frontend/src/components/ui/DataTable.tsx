import { useState, useMemo } from 'react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: any) => React.ReactNode;
}

interface Action {
  label: string;
  onClick: (item: any) => void;
  className?: string;
  show?: (item: any) => boolean;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  searchable?: boolean;
  searchKeys?: string[];
  emptyMessage?: string;
  pageSize?: number;
  defaultSort?: {
    key: string;
    direction: 'asc' | 'desc';
  };
}

const DataTable = ({
  data,
  columns,
  actions = [],
  searchable = false,
  searchKeys = [],
  emptyMessage = "No data found",
  pageSize = 10,
  defaultSort
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(defaultSort?.key || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSort?.direction || 'asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return data;
    
    const term = searchTerm.toLowerCase();
    return data.filter(item => {
      if (searchKeys.length > 0) {
        return searchKeys.some(key => {
          const value = String(item[key] || '').toLowerCase();
          return value.includes(term);
        });
      } else {
        return Object.values(item).some(value => 
          String(value || '').toLowerCase().includes(term)
        );
      }
    });
  }, [data, searchTerm, searchKeys, searchable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const renderCell = (item: any, column: Column) => {
    if (column.render) {
      return column.render(item);
    }
    return String(item[column.key] || '');
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      {searchable && (
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="input-field w-64"
          />
          <div className="text-sm text-gray-500">
            {sortedData.length} of {data.length} items
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className="text-gray-400">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {renderCell(item, column)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {actions
                          .filter(action => !action.show || action.show(item))
                          .map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(item)}
                            className={`${action.className || 'text-primary-600 hover:text-primary-900'}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;