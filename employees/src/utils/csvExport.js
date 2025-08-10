/**
 * Utility function to convert JSON data to CSV format
 * @param {Array} data - The array of objects to convert
 * @returns {string} - CSV formatted string
 */
export function convertToCSV(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return '';
  }

  // Get the headers from the first item
  const headers = Object.keys(data[0]);
  
  // Create CSV header row
  const csvRows = [
    headers.join(',')
  ];
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle undefined, null values and commas in the data
      if (value === undefined || value === null) {
        return '';
      }
      
      const valueStr = String(value);
      // Escape quotes and wrap values with commas in quotes
      if (valueStr.includes(',') || valueStr.includes('"') || valueStr.includes('\n')) {
        return `"${valueStr.replace(/"/g, '""')}"`;
      }
      return valueStr;
    });
    
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Downloads data as a CSV file
 * @param {Array} data - The array of objects to download as CSV
 * @param {string} filename - The name of the file to download
 */
export function downloadCSV(data, filename) {
  if (!data) {
    console.error('No data provided for CSV download');
    return;
  }
  
  const csvContent = convertToCSV(data);
  if (!csvContent) {
    console.error('Failed to convert data to CSV');
    return;
  }
  
  // Create a blob and download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads data as a JSON file
 * @param {Object|Array} data - The data to download as JSON
 * @param {string} filename - The name of the file to download
 */
export function downloadJSON(data, filename) {
  if (!data) {
    console.error('No data provided for JSON download');
    return;
  }
  
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.json');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
