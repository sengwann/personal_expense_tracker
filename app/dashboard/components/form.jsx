"use client";

import { memo, useState, useCallback } from "react";
import {
  FormControl,
  Input,
  Select,
  Stack,
  InputGroup,
  InputRightAddon,
  Button,
  useToast,
} from "@chakra-ui/react";
import { doc, runTransaction, collection, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  showToast,
  updateExistingTotals,
  initializeNewTotals,
  expenseByCategory,
  incomeByCategory,
  currency,
  formatDate,
  currencyOptions,
  categoryOptions,
} from "../../lib/utils/util";
import { FaPlus } from "react-icons/fa";
import { MdClear } from "react-icons/md";

const TransactionForm = memo(({ userId, mutateTransactions }) => {
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    date: formatDate(),
    amount: "",
    description: "",
    currency: "THB",
  });
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "type" && value !== prev.type) {
        return { ...prev, type: value, category: "" };
      }
      // If changing the date, store as YYYY-MM-DD only
      if (name === "date") {
        return { ...prev, date: value };
      }
      // Prevent non-numeric input for amount
      if (name === "amount") {
        // Only allow numbers and empty string
        if (!/^\d*\.?\d*$/.test(value)) {
          return prev;
        }
        return {
          ...prev,
          amount: value === "" ? "" : Math.max(0, Number(value)),
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);

  const processTransaction = useCallback(async () => {
    const tranRef = doc(collection(db, "users", userId, "transactions"));
    const totalRef = doc(
      db,
      "users",
      userId,
      "dailyTotals",
      `${formData.date}_${formData.currency}`
    );

    const amount = Number(formData.amount);

    const newTransaction = {
      ...formData,
      date: Timestamp.fromDate(new Date(`${formData.date}T00:00:00Z`)),
      amount,
      id: tranRef.id,
    };

    try {
      await runTransaction(db, async (transaction) => {
        const totalSnap = await transaction.get(totalRef);
        transaction.set(tranRef, newTransaction);

        if (totalSnap.exists()) {
          updateExistingTotals(
            transaction,
            totalRef,
            totalSnap.data(),
            newTransaction
          );
        } else {
          initializeNewTotals(transaction, totalRef, newTransaction);
        }
      });
    } catch (error) {
      showToast(
        error.message || "Error occur while processing add transaction!",
        "error",
        toast
      );
    }
  }, [userId, formData, toast]);

  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();
      // Check if date is in the future (compare YYYY-MM-DD strings)
      const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      if (formData.date > todayStr) {
        showToast("Date cannot be in the future.", "error", toast);
        return;
      }

      setLoading(true);

      try {
        await processTransaction();
        resetForm();
        showToast("Transaction added!", "success", toast);
      } catch (err) {
        showToast(`Error adding transaction: ${err.message}`, "error", toast);
      } finally {
        mutateTransactions();
        setLoading(false);
      }
    },
    [formData, mutateTransactions, toast, processTransaction]
  );

  const resetForm = () => {
    setFormData({
      type: "",
      category: "",
      date: formatDate(),
      amount: "",
      description: "",
      currency: "THB",
    });
  };

  return (
    <form onSubmit={handleAdd}>
      <Stack spacing={4} mb={4}>
        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <FormControl w="100%">
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="">Type</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </Select>
          </FormControl>

          <FormControl w="100%">
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categoryOptions(
                formData.type,
                expenseByCategory,
                incomeByCategory
              )}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ base: "column", md: "row" }} spacing={4}>
          <FormControl w="100%">
            <Input
              type="date"
              name="date"
              value={formData.date || ""}
              onChange={handleChange}
              required
            />
          </FormControl>

          <FormControl w="100%">
            <InputGroup w="100%">
              <Input
                placeholder="Amount"
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min={0}
              />
              <InputRightAddon p={0}>
                <Select
                  border="none"
                  size="sm"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  required
                >
                  {currencyOptions(currency)}
                </Select>
              </InputRightAddon>
            </InputGroup>
          </FormControl>
        </Stack>

        <FormControl w="100%">
          <Input
            placeholder="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </FormControl>

        <Stack direction="row" spacing={4}>
          <Button
            bg="#1E3A8A"
            color="white"
            _hover={{ bg: "#F97316" }}
            w="100%"
            type="submit"
            isLoading={loading}
            loadingText="Adding..."
            leftIcon={<FaPlus />}
          >
            Add transaction
          </Button>

          <Button
            variant="outline"
            w="100%"
            onClick={resetForm}
            isDisabled={loading}
            leftIcon={<MdClear />}
          >
            Clear Form
          </Button>
        </Stack>
      </Stack>
    </form>
  );
});

TransactionForm.displayName = "TransactionForm";

export default TransactionForm;
