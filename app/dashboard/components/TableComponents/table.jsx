"use client";

import { memo, useMemo, useCallback } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  IconButton,
  TableContainer,
  useToast,
  Skeleton,
  Text,
  Box,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import { DeleteIcon } from "@chakra-ui/icons";
import * as Md from "react-icons/md";
import * as Fa from "react-icons/fa";

import UpdateTransactionModal from "./UpdateTransactionModal";
import {
  showToast,
  getCategoryIcon,
  formatDate,
  isAllZeroTotals,
  getSymbol,
} from "@/app/lib/utils/util";

function TransactionsTable({
  userId,
  transactions,
  mutateTransactions,
  isLoading,
}) {
  const toast = useToast();

  // Memoize the delete handler since it's passed to multiple IconButtons
  const handleDelete = useCallback(
    async (transactionToDelete) => {
      try {
        const tranRef = doc(
          db,
          "users",
          userId,
          "transactions",
          transactionToDelete.id
        );
        const totalRef = doc(
          db,
          "users",
          userId,
          "dailyTotals",
          `${formatDate(transactionToDelete.date)}_${
            transactionToDelete.currency
          }`
        );

        await runTransaction(db, async (transaction) => {
          const tranDoc = await transaction.get(tranRef);
          if (!tranDoc.exists()) {
            showToast("Transaction does not exist", "error", toast);
            return;
          }

          const totalsDoc = await transaction.get(totalRef);
          if (!totalsDoc.exists()) {
            showToast("Totals document does not exist", "error", toast);
            return;
          }

          const transactionData = tranDoc.data();
          const totalsData = { ...totalsDoc.data() };

          const { type, category, amount } = transactionData;

          // Prevent negative values
          if (type === "Expense") {
            totalsData.totalExpense = Math.max(
              0,
              totalsData.totalExpense - amount
            );
            totalsData.expenseByCategory[category] = Math.max(
              0,
              (totalsData.expenseByCategory?.[category] || 0) - amount
            );
          } else if (type === "Income") {
            totalsData.totalIncome = Math.max(
              0,
              totalsData.totalIncome - amount
            );
            totalsData.incomeByCategory[category] = Math.max(
              0,
              (totalsData.incomeByCategory?.[category] || 0) - amount
            );
          }
          // If all totals are zero, remove the document, else update it
          if (isAllZeroTotals(totalsData)) {
            transaction.delete(totalRef);
          } else {
            transaction.set(totalRef, totalsData);
          }
          transaction.delete(tranRef);
        });

        showToast("Transaction deleted!", "success", toast);
      } catch (err) {
        showToast(`Error deleting transaction: ${err.message}`, "error", toast);
      } finally {
        mutateTransactions();
      }
    },
    [mutateTransactions, toast, userId]
  );

  // Memoize skeleton rows to avoid recreating the array on every render
  const skeletonRows = useMemo(() => {
    return [...Array(10)].map((_, i) => (
      <Tr key={i}>
        {Array(6)
          .fill("")
          .map((_, index) => (
            <Td key={index}>
              <Skeleton height="20px" />
            </Td>
          ))}
      </Tr>
    ));
  }, []);

  // Memoize transaction rows to prevent recalculation when transactions haven't changed
  const transactionRows = useMemo(
    () =>
      transactions.map((transaction) => (
        <Tr key={transaction.id}>
          <Td>{formatDate(transaction.date)}</Td>
          <Td>
            <Badge
              fontWeight="bold"
              colorScheme={transaction.type === "Income" ? "green" : "red"}
            >
              {transaction.type}
            </Badge>
          </Td>
          <Td>
            <Icon
              as={getCategoryIcon(transaction.category, Md, Fa)}
              boxSize={4}
              mr={2}
              color={transaction.type === "Income" ? "green.500" : "red.500"}
            />
            {transaction.category.charAt(0).toUpperCase() +
              transaction.category.slice(1)}
          </Td>
          <Td maxW="200px" color="gray.700" isTruncated>
            {transaction.description}
          </Td>
          <Td isNumeric>
            {transaction.amount}{" "}
            <Text as="span" color="gray.500" fontWeight="bold">
              {getSymbol(transaction?.currency || "THB")}
            </Text>
          </Td>
          <Td>
            <HStack spacing={2}>
              <UpdateTransactionModal
                userId={userId}
                transaction={transaction}
                mutateTransactions={mutateTransactions}
              />
              <Tooltip label="Delete transaction" placement="top" hasArrow>
                <IconButton
                  icon={<DeleteIcon />}
                  colorScheme="red"
                  aria-label="Delete transaction"
                  onClick={() => handleDelete(transaction)}
                  size="sm"
                />
              </Tooltip>
            </HStack>
          </Td>
        </Tr>
      )),
    [transactions, handleDelete, mutateTransactions, userId]
  );

  return (
    <TableContainer maxH="600px" minH="300px" overflowX="auto">
      <Table variant="simple" mb={8} size="sm">
        <Thead bg="gray.200" position="sticky" top="0" zIndex="1">
          <Tr>
            <Th color="#1E3A8A">Date</Th>
            <Th color="#1E3A8A">Type</Th>
            <Th color="#1E3A8A">Category</Th>
            <Th color="#1E3A8A">Description</Th>
            <Th isNumeric color="#1E3A8A">
              Amount
            </Th>
            <Th color="#1E3A8A">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {isLoading ? (
            skeletonRows
          ) : transactions.length === 0 ? (
            <Tr>
              <Td colSpan={6}>
                <Box textAlign="center" color="gray.500" py={8}>
                  <Text>No transactions found.</Text>
                </Box>
              </Td>
            </Tr>
          ) : (
            transactionRows
          )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default memo(TransactionsTable);
