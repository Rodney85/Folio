import React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    className?: string;
}

interface ResponsiveTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (row: T) => string;
    renderMobileCard: (row: T) => React.ReactNode;
    onRowClick?: (row: T) => void;
    emptyMessage?: string;
}

export function ResponsiveTable<T>({
    data,
    columns,
    keyExtractor,
    renderMobileCard,
    onRowClick,
    emptyMessage = "No data available."
}: ResponsiveTableProps<T>) {

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-lg border border-dashed">
                {emptyMessage}
            </div>
        );
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableHead key={index} className={column.className}>
                                    {column.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow
                                key={keyExtractor(row)}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={cn(
                                    "transition-colors hover:bg-muted/50",
                                    onRowClick && "cursor-pointer"
                                )}
                            >
                                {columns.map((column, index) => (
                                    <TableCell key={index} className={column.className}>
                                        {column.cell
                                            ? column.cell(row)
                                            : column.accessorKey
                                                ? (row[column.accessorKey] as React.ReactNode)
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                {data.map((row) => (
                    <div key={keyExtractor(row)}>
                        {renderMobileCard(row)}
                    </div>
                ))}
            </div>
        </>
    );
}
