"use client";

import { Stack, Button, useToast } from "@chakra-ui/react";
import Filters from "./filter";
import DeleteBatchButton from "./deleteBatchButton";
import exportToExcel from "@/app/lib/exportExcel/exportExcel";
import { useCallback, useState } from "react";
import { FaFileExcel } from "react-icons/fa";

export default function MainActions({
  filters,
  setFilters,
  transactions,
  userId,
  mutateTransactions,
  isTransactionsLoading,
}) {
  const [exportLoading, setExportLoading] = useState(false);
  const toast = useToast();

  // Export to Excel handler
  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      await exportToExcel(userId, filters, toast);
    } finally {
      setExportLoading(false);
    }
  }, [userId, filters, toast]);

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={4}
      justifyContent="center"
      alignItems="center"
      mb={8}
    >
      <DeleteBatchButton
        isDisabled={isTransactionsLoading}
        userId={userId}
        mutateTransactions={mutateTransactions}
      />

      <Filters
        filters={filters}
        isDisabled={isTransactionsLoading}
        setFilters={setFilters}
        transactions={transactions}
        userId={userId}
      />

      <Button
        bg="#1E3A8A"
        color="white"
        _hover={{ bg: "#F97316" }}
        borderRadius="4px"
        px={4}
        py={2}
        minW={{ base: "100%", md: "250px" }}
        w={{ base: "100%", md: "250px" }}
        fontSize="sm"
        onClick={handleExport}
        isLoading={exportLoading}
        isDisabled={isTransactionsLoading}
        loadingText="Exporting"
        leftIcon={<FaFileExcel />}
      >
        Export to Excel
      </Button>
    </Stack>
  );
}
