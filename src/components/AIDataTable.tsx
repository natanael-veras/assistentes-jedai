
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { renderSimpleMarkdown } from '@/utils/markdownUtils';

interface TableData {
  headers: string[];
  rows: string[][];
}

interface AIDataTableProps {
  data: TableData;
  className?: string;
}

const AIDataTable: React.FC<AIDataTableProps> = ({ data, className }) => {
  if (!data.headers || !data.rows || data.rows.length === 0) {
    return null;
  }

  return (
    <div className={cn("my-4 overflow-hidden rounded-lg border", className)}>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            {data.headers.map((header, index) => (
              <TableHead key={index} className="font-semibold text-foreground">
                {renderSimpleMarkdown(header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/30">
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="text-sm">
                  {renderSimpleMarkdown(cell)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AIDataTable;
