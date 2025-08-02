"use client";

import { useState, memo, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormLabel,
  Stack,
  FormControl,
  Input,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, IconButton } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { doc, runTransaction, Timestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  categoryOptions,
  expenseByCategory,
  incomeByCategory,
  showToast,
  formatDate,
  isAllZeroTotals,
} from "@/app/lib/utils/util";

function UpdateTransactionModal({
  userId,
  transaction: oldTransaction,
  mutateTransactions,
}) {
  const { isOpen, onOpen: chakraOnOpen, onClose } = useDisclosure();
  // Ensure date is always a string in YYYY-MM-DD format
  const initialData = {
    ...oldTransaction,
    date: oldTransaction.date ? formatDate(oldTransaction.date) : "",
  };
  const [updatedData, setUpdatedData] = useState(initialData);

  // When modal opens, reset updatedData to latest oldTransaction
  const onOpen = useCallback(() => {
    setUpdatedData({
      ...oldTransaction,
      date: oldTransaction.date ? formatDate(oldTransaction.date) : "",
    });
    chakraOnOpen();
  }, [oldTransaction, chakraOnOpen]);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // Memoize the handleInputChange function to avoid recreating it on every render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true);

      const { type, category, date, amount } = updatedData;

      // Check if date is in the future (compare YYYY-MM-DD strings)
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (date > todayStr) {
        showToast("Date cannot be in the future.", "error", toast);
        return;
      }

      const sameDate = formatDate(oldTransaction.date) === updatedData.date;

      const oldTranRef = doc(
        db,
        "users",
        userId,
        "transactions",
        oldTransaction.id
      );
      const oldTotalRef = doc(
        db,
        "users",
        userId,
        "dailyTotals",
        `${formatDate(oldTransaction.date)}_${oldTransaction.currency}`
      );
      const newTotalRef = doc(
        db,
        "users",
        userId,
        "dailyTotals",
        `${formatDate(updatedData.date)}_${updatedData.currency}`
      );

      await runTransaction(db, async (transaction) => {
        const tranDoc = await transaction.get(oldTranRef);
        if (!tranDoc.exists()) {
          showToast("Transaction does not exist", "error", toast);
          return;
        }

        const oldTotalSnap = await transaction.get(oldTotalRef);
        if (!oldTotalSnap.exists()) {
          showToast("Old totals document missing", "error", toast);
          return;
        }

        const newTotalSnap = sameDate
          ? oldTotalSnap
          : await transaction.get(newTotalRef);

        // Remove old effect
        const oldTotals = { ...oldTotalSnap.data() };
        if (oldTransaction.type === "Expense") {
          oldTotals.totalExpense -= oldTransaction.amount;
          oldTotals.expenseByCategory[oldTransaction.category] =
            (oldTotals.expenseByCategory?.[oldTransaction.category] || 0) -
            oldTransaction.amount;
        } else {
          oldTotals.totalIncome -= oldTransaction.amount;
          oldTotals.incomeByCategory[oldTransaction.category] =
            (oldTotals.incomeByCategory?.[oldTransaction.category] || 0) -
            oldTransaction.amount;
        }

        if (isAllZeroTotals(oldTotals)) {
          transaction.delete(oldTotalRef);
        } else {
          transaction.set(oldTotalRef, oldTotals);
        }

        // Apply new effect
        const newTotals = sameDate
          ? oldTotals
          : {
              ...(newTotalSnap?.data() || {
                totalExpense: 0,
                totalIncome: 0,
                currency: updatedData.currency,
                expenseByCategory: {},
                incomeByCategory: {},
                date: Timestamp.fromDate(
                  new Date(`${updatedData.date}T00:00:00Z`)
                ),
              }),
            };

        if (type === "Expense") {
          newTotals.totalExpense += amount;
          newTotals.expenseByCategory[category] =
            (newTotals.expenseByCategory?.[category] || 0) + amount;
        } else {
          newTotals.totalIncome += amount;
          newTotals.incomeByCategory[category] =
            (newTotals.incomeByCategory?.[category] || 0) + amount;
        }

        if (isAllZeroTotals(newTotals)) {
          transaction.delete(newTotalRef);
        } else {
          transaction.set(newTotalRef, newTotals);
        }

        // Update the transaction

        transaction.update(oldTranRef, {
          ...updatedData,
          date: Timestamp.fromDate(new Date(`${updatedData.date}T00:00:00Z`)),
        });
      });

      showToast("Transaction updated!", "success", toast);
    } catch (err) {
      showToast(`Error updating transaction: ${err.message}`, "error", toast);
    } finally {
      mutateTransactions();
      onClose();
      setLoading(false);
    }
  }, [updatedData, mutateTransactions, toast, onClose, oldTransaction, userId]);

  return (
    <>
      <Tooltip label="Edit transaction" placement="top" hasArrow>
        <IconButton
          icon={<EditIcon />}
          colorScheme="blue"
          bg="#1E3A8A"
          aria-label="Edit transaction"
          onClick={onOpen}
          size="sm"
          _hover={{ bg: "#F97316" }}
        />
      </Tooltip>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={{ base: "90vw", md: "500px" }} bg="white">
          <ModalHeader bg="#F3F4F6" color="#1E3A8A">
            Edit Transaction
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color="#374151">Type</FormLabel>
                <Select
                  placeholder="Select Type"
                  size="md"
                  value={updatedData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setUpdatedData((prevData) => ({
                      ...prevData,
                      type: newType,
                      category: "",
                    }));
                  }}
                  required
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="#374151">Category</FormLabel>
                <Select
                  name="category"
                  value={updatedData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categoryOptions(
                    updatedData.type,
                    expenseByCategory,
                    incomeByCategory
                  )}
                </Select>
              </FormControl>

              {/* Date Field */}
              <FormControl>
                <FormLabel color="#374151">Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={updatedData.date || ""}
                  onChange={handleInputChange}
                  required
                />
              </FormControl>

              {/* Amount Field */}
              <FormControl w="100%">
                <FormLabel color="#374151">Amount</FormLabel>
                <Input
                  type="number"
                  name="amount"
                  required
                  value={updatedData.amount}
                  onChange={(e) => {
                    const newAmount = e.target.value;

                    // Only allow numbers and prevent typing non-numeric characters
                    if (/^\d*\.?\d*$/.test(newAmount)) {
                      setUpdatedData((prevData) => ({
                        ...prevData,
                        amount: +newAmount,
                      }));
                    }
                  }}
                  inputMode="decimal"
                  pattern="[0-9]*"
                />
              </FormControl>

              {/* Description Field */}
              <FormControl>
                <FormLabel color="#374151">Description</FormLabel>
                <Input
                  name="description"
                  value={updatedData.description}
                  onChange={handleInputChange}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              bg="#1E3A8A"
              mr={3}
              onClick={handleUpdate}
              _hover={{ bg: "#F97316" }}
              isLoading={loading}
              loadingText="Saving..."
              leftIcon={<FaEdit />}
            >
              Save
            </Button>
            <Button variant="ghost" onClick={onClose} color="#374151">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default memo(UpdateTransactionModal);
