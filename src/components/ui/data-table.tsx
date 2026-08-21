"use client"

import * as React from "react"
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  createSortedRowModel,
  flexRender,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export type DataTableColumn<T> = {
  id: string
  header: React.ReactNode
  cell: (row: T) => React.ReactNode
  className?: string
  sortable?: boolean
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  data: T[]
  rowKey: (row: T) => string
  rowActions?: (row: T) => React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  onView?: (row: T) => void
}

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
})

type TanStackColumn<T extends RowData> = ColumnDef<
  typeof dataTableFeatures,
  T,
  unknown
>

function DataTable<T>({
  columns,
  data,
  rowKey,
  rowActions,
  emptyTitle = "No results",
  emptyDescription,
  onView,
}: DataTableProps<T>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columnDefs = React.useMemo<TanStackColumn<RowData>[]>(
    () =>
      columns.map((column) => ({
        id: column.id,
        accessorKey: column.id,
        header: () => column.header,
        cell: ({ row }) => column.cell(row.original as T),
        enableSorting: column.sortable === true,
      })),
    [columns]
  )

  const table = useTable({
    features: dataTableFeatures,
    columns: columnDefs,
    data: data as RowData[],
    getRowId: (row) => rowKey(row as T),
    state: { sorting },
    onSortingChange: setSorting,
  })

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const column = columns.find((c) => c.id === header.id)
              return (
                <TableHead key={header.id} className={column?.className}>
                  {header.isPlaceholder
                    ? null
                    : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="-ml-2 h-6"
                          onClick={() => header.column.toggleSorting()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="size-3.5" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="size-3.5" />
                          ) : (
                            <ChevronsUpDown className="size-3.5" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                </TableHead>
              )
            })}
            {rowActions ? (
              <TableHead className="text-right">Actions</TableHead>
            ) : null}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (rowActions ? 1 : 0)}
              className="h-24"
            >
              <div className="flex flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{emptyTitle}</p>
                {emptyDescription ? <p>{emptyDescription}</p> : null}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn(onView && "cursor-pointer")}
              onClick={onView ? () => onView(row.original as T) : undefined}
            >
              {row.getAllCells().map((cell) => {
                const column = columns.find((c) => c.id === cell.column.id)
                return (
                  <TableCell key={cell.id} className={column?.className}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                )
              })}
              {rowActions ? (
                <TableCell className="text-right">
                  {rowActions(row.original as T)}
                </TableCell>
              ) : null}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

function DataTableColumnHeader({
  title,
  className,
}: {
  title: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs font-medium text-muted-foreground",
        className
      )}
    >
      {title}
    </div>
  )
}

export { DataTable, DataTableColumnHeader }

