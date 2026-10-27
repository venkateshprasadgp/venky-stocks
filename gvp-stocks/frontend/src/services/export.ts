export const exportToCSV = (ticker: string) => {
  const downloadUrl = `http://127.0.0.1:8000/api/stock/${ticker}/export?format=csv`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${ticker}_data.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
