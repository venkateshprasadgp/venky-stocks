export const exportToCSV = (ticker: string) => {
  const downloadUrl = `/api/stock/${ticker}/export?format=csv`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.setAttribute('download', `${ticker}_data.csv`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
