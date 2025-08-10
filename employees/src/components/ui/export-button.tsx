import React from 'react';
import { Button } from './button';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu';

interface ExportButtonProps {
  onExportCSV: () => void;
  onExportJSON?: () => void;
  onExportPDF?: () => void;
  buttonSize?: 'sm' | 'lg' | 'default' | 'icon';
  label?: string;
}

/**
 * ExportButton component for handling different types of data exports
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ 
  onExportCSV, 
  onExportJSON, 
  onExportPDF, 
  buttonSize = 'sm',
  label = 'Export'
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size={buttonSize}>
          <Download className="w-4 h-4 mr-2" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onExportCSV} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          <span>Export as CSV</span>
        </DropdownMenuItem>
        
        {onExportJSON && (
          <DropdownMenuItem onClick={onExportJSON} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            <span>Export as JSON</span>
          </DropdownMenuItem>
        )}
        
        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
            <FileImage className="w-4 h-4 mr-2" />
            <span>Export as PDF</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
