import React from 'react';
import { Button } from '../ui/button.jsx';
import { Download, FileSpreadsheet, FileText, FileImage } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu.jsx';

/**
 * ExportButton component for handling different types of data exports
 * @param {Function} onExportCSV - Function to handle CSV export
 * @param {Function} onExportJSON - Function to handle JSON export (optional)
 * @param {Function} onExportPDF - Function to handle PDF export (optional)
 * @param {String} buttonSize - Size of the button (sm, md, lg)
 * @param {String} label - Button label
 */
export const ExportButton = ({ 
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
