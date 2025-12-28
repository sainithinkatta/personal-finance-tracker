
import React, { useState } from 'react';
import { Download, FileText, File, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Expense, CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExportDataButtonProps {
  expenses: Expense[];
}

const ExportDataButton: React.FC<ExportDataButtonProps> = ({ expenses }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
  };

  const generateFileName = (fileFormat: string) => {
    const currentDate = format(new Date(), 'MMMM-yyyy').toLowerCase();
    return `expenses-${currentDate}.${fileFormat}`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Currency'];
    const csvData = expenses.map(expense => [
      format(expense.date, 'MMM d, yyyy'),
      expense.category,
      expense.description || '',
      expense.amount.toString(),
      expense.currency
    ]);

    // Add total expenses row
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRow = ['', '', 'Total Expenses', totalAmount.toString(), expenses[0]?.currency || 'USD'];

    const csvContent = [headers, ...csvData, totalRow]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    downloadFile(csvContent, generateFileName('csv'), 'text/csv');
  };

  const exportToPDF = () => {
    // Create a simple HTML structure for PDF conversion
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Expense Report - ${format(new Date(), 'MMMM yyyy')}</h1>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${format(expense.date, 'MMM d, yyyy')}</td>
                <td>${expense.category}</td>
                <td>${expense.description || '-'}</td>
                <td>${formatCurrency(expense.amount, expense.currency)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3"><strong>Total Expenses</strong></td>
              <td><strong>${formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0), expenses[0]?.currency || 'USD')}</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadFile(htmlContent, generateFileName('html'), 'text/html');
  };

  const exportToDOC = () => {
    // Create a simple DOC-compatible HTML structure
    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8">
        <title>Expense Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total { font-weight: bold; background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>Expense Report - ${format(new Date(), 'MMMM yyyy')}</h1>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(expense => `
              <tr>
                <td>${format(expense.date, 'MMM d, yyyy')}</td>
                <td>${expense.category}</td>
                <td>${expense.description || '-'}</td>
                <td>${formatCurrency(expense.amount, expense.currency)}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td colspan="3"><strong>Total Expenses</strong></td>
              <td><strong>${formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0), expenses[0]?.currency || 'USD')}</strong></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadFile(docContent, generateFileName('doc'), 'application/msword');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (fileFormat: 'csv' | 'pdf' | 'doc') => {
    if (expenses.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no expenses to export.',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);

    try {
      switch (fileFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'pdf':
          exportToPDF();
          break;
        case 'doc':
          exportToDOC();
          break;
      }

      toast({
        title: 'Export Successful',
        description: `Your expenses have been exported as ${fileFormat.toUpperCase()}.`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || expenses.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border border-border shadow-lg z-50">
        <DropdownMenuItem
          onClick={() => handleExport('csv')}
          className="flex items-center gap-2 hover:bg-muted cursor-pointer"
        >
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('doc')}
          className="flex items-center gap-2 hover:bg-muted cursor-pointer"
        >
          <FileText className="h-4 w-4 text-blue-600" />
          Export as DOC
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          className="flex items-center gap-2 hover:bg-muted cursor-pointer"
        >
          <File className="h-4 w-4 text-red-600" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDataButton;
