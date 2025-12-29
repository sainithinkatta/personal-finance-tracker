
import React, { useState } from 'react';
import { Download, FileText, File, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Transaction } from '@/types/transaction';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ExportDataButtonProps {
  transactions: Transaction[];
}

const ExportDataButton: React.FC<ExportDataButtonProps> = ({ transactions }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toFixed(2)}`;
  };

  const generateFileName = (fileFormat: string) => {
    const currentDate = format(new Date(), 'MMMM-yyyy').toLowerCase();
    return `transactions-${currentDate}.${fileFormat}`;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'];
    const csvData = transactions.map(tx => [
      format(tx.date, 'MMM d, yyyy'),
      tx.type === 'income' ? 'Income' : 'Expense',
      tx.category,
      tx.description || '',
      tx.amount.toString(), // Negative for income (credit)
      tx.currency
    ]);

    // Calculate net totals
    const totalExpenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const netTotal = totalExpenses - totalIncome;

    const totalRow = ['', '', '', 'Net Total', netTotal.toString(), transactions[0]?.currency || 'USD'];

    const csvContent = [headers, ...csvData, totalRow]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    downloadFile(csvContent, generateFileName('csv'), 'text/csv');
  };

  const exportToPDF = () => {
    const totalExpenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const currency = transactions[0]?.currency || 'USD';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; text-align: center; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .total { font-weight: bold; background-color: #f9f9f9; }
          .income { color: #059669; }
          .expense { color: #333; }
          .summary { margin-top: 20px; padding: 10px; background: #f9f9f9; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>Transaction Report - ${format(new Date(), 'MMMM yyyy')}</h1>
        <div class="summary">
          <p><strong>Total Expenses:</strong> ${formatCurrency(totalExpenses, currency)}</p>
          <p><strong>Total Income:</strong> ${formatCurrency(totalIncome, currency)}</p>
          <p><strong>Net:</strong> ${formatCurrency(totalExpenses - totalIncome, currency)}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${format(tx.date, 'MMM d, yyyy')}</td>
                <td>${tx.type === 'income' ? 'Income' : 'Expense'}</td>
                <td>${tx.category}</td>
                <td>${tx.description || '-'}</td>
                <td class="${tx.type === 'income' ? 'income' : 'expense'}">${formatCurrency(tx.amount, tx.currency)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    downloadFile(htmlContent, generateFileName('html'), 'text/html');
  };

  const exportToDOC = () => {
    const totalExpenses = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    const currency = transactions[0]?.currency || 'USD';

    const docContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
      <head>
        <meta charset="utf-8">
        <title>Transaction Report</title>
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
        <h1>Transaction Report - ${format(new Date(), 'MMMM yyyy')}</h1>
        <p><strong>Total Expenses:</strong> ${formatCurrency(totalExpenses, currency)}</p>
        <p><strong>Total Income:</strong> ${formatCurrency(totalIncome, currency)}</p>
        <p><strong>Net:</strong> ${formatCurrency(totalExpenses - totalIncome, currency)}</p>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${format(tx.date, 'MMM d, yyyy')}</td>
                <td>${tx.type === 'income' ? 'Income' : 'Expense'}</td>
                <td>${tx.category}</td>
                <td>${tx.description || '-'}</td>
                <td>${formatCurrency(tx.amount, tx.currency)}</td>
              </tr>
            `).join('')}
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
    if (transactions.length === 0) {
      toast({
        title: 'No Data to Export',
        description: 'There are no transactions to export.',
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
        description: `Your transactions have been exported as ${fileFormat.toUpperCase()}.`,
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
          disabled={isExporting || transactions.length === 0}
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
