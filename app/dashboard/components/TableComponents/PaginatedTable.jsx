"use client";

import { memo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Box, IconButton, Text } from "@chakra-ui/react";
import TransactionsTable from "./table";

function PaginatedTable({
  transactions = [],
  mutateTransactions,
  isLoading,
  userId,
  hasMore = false,
  onNextPage,
  onPrevPage,
  page = 1,
  totalPages = 1,
}) {
  return (
    <Box>
      <TransactionsTable
        userId={userId}
        isLoading={isLoading}
        transactions={transactions}
        mutateTransactions={mutateTransactions}
      />
      <Box
        mt={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ base: 3, md: 4 }}
      >
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Previous page"
          isDisabled={page <= 1}
          onClick={onPrevPage}
          size={{ base: "sm", md: "md" }}
        />
        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
          Page {page} of {totalPages}
        </Text>
        <IconButton
          icon={<ChevronRightIcon />}
          aria-label="Next page"
          isDisabled={!hasMore}
          onClick={onNextPage}
          size={{ base: "sm", md: "md" }}
        />
      </Box>
    </Box>
  );
}
export default memo(PaginatedTable);
