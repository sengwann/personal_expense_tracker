import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatDate, showToast } from "../utils/util";

const exportToExcel = async (userId, filters, toast) => {
  if (!userId) {
    showToast("User ID is required for export.", "error", toast);
    return;
  }
  // Fetch transactions based on filters
  const transactionsResponse = await fetch(
    `/api/transactions/exportToExcel?userId=${userId}&type=${
      filters.type || ""
    }&category=${filters.category || ""}&currency=${
      filters.currency
    }&startDate=${filters.startDate || ""}&endDate=${filters.endDate || ""}`
  );
  const transactionsJson = await transactionsResponse.json();
  const transactions = transactionsJson.transactions || [];

  if (transactions.length === 0) {
    showToast("No transactions found for export.", "error", toast);
    return;
  }

  const fileName = `Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Convert transactions to rows
  const headers = ["Date", "Type", "Category", "Amount", "Description"];
  const data = transactions.map((tx) => [
    formatDate(tx.date),
    tx.type,
    tx.category,
    tx.amount,
    tx.description || "N/A",
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Auto-size columns
  worksheet["!cols"] = headers.map((_, i) => ({
    wch:
      Math.max(
        headers[i].length,
        ...data.map((row) => (row[i] ? row[i].toString().length : 0))
      ) + 2,
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    `${filters?.type || "Expenses"}`
  );

  // Save File
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(dataBlob, fileName);
};

export default exportToExcel;
