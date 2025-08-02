"use client";

import { useState, memo, useCallback, useMemo } from "react";
import {
  Button,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Stack,
} from "@chakra-ui/react";
import {
  expenseByCategory,
  incomeByCategory,
  categoryOptions,
  currency,
  currencyOptions,
} from "@/app/lib/utils/util";
import { MdFilterList, MdClear } from "react-icons/md";

const Filters = memo(({ filters, setFilters, isDisabled }) => {
  // Initialize tempFilters with current filters
  const [tempFilters, setTempFilters] = useState(() => ({
    currency: filters.currency || "",
    type: filters.type || "",
    category: filters.category || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize openModal since it's passed to Button onClick
  const openModal = useCallback(() => {
    setTempFilters({
      currency: filters.currency || "",
      type: filters.type || "",
      category: filters.category || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
    setIsModalOpen(true);
  }, [filters]);

  // Memoize closeModal since it's passed to multiple onClick handlers
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoize applyFilters since it depends on tempFilters and setFilters
  const applyFilters = useCallback(() => {
    // Always send endDate as YYYY-MM-DD
    const filtersToApply = {
      ...tempFilters,
      endDate: tempFilters.endDate ? tempFilters.endDate.slice(0, 10) : "",
      startDate: tempFilters.startDate
        ? tempFilters.startDate.slice(0, 10)
        : "",
    };
    setFilters(filtersToApply);
    setIsModalOpen(false);
  }, [tempFilters, setFilters]);

  // Memoize filter change handler
  const handleTempFilterChange = useCallback((field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Memoize category options to prevent recalculation
  const categoryOption = useMemo(() => {
    const showAll = tempFilters.type === "";
    const showExpense = showAll || tempFilters.type === "Expense";
    const showIncome = showAll || tempFilters.type === "Income";

    return [
      ...(!showAll && showExpense
        ? categoryOptions("Expense", expenseByCategory, incomeByCategory)
        : []),
      ...(!showAll && showIncome
        ? categoryOptions("Income", expenseByCategory, incomeByCategory)
        : []),
    ];
  }, [tempFilters.type]);

  // Clear filters handler
  const handleClear = () => {
    setTempFilters({
      currency: "",
      type: "",
      category: "",
      startDate: "",
      endDate: "",
    });
    setFilters({
      currency: "",
      type: "",
      category: "",
      startDate: "",
      endDate: "",
    });
    closeModal();
  };

  return (
    <>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          colorScheme="teal"
          w={{ base: "100%", md: "250px" }}
          onClick={openModal}
          leftIcon={<MdFilterList />}
          isDisabled={isDisabled}
        >
          Open Filters
        </Button>
      </Stack>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Filters</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Currency</FormLabel>
                <Select
                  value={tempFilters.currency}
                  onChange={(e) =>
                    handleTempFilterChange("currency", e.target.value)
                  }
                >
                  <option value="">All</option>
                  {currencyOptions(currency)}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={tempFilters.type}
                  onChange={(e) =>
                    handleTempFilterChange("type", e.target.value)
                  }
                >
                  <option value="">All</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={tempFilters.category}
                  onChange={(e) =>
                    handleTempFilterChange("category", e.target.value)
                  }
                >
                  <option value="">Select Category</option>
                  {categoryOption}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={tempFilters.startDate}
                  onChange={(e) =>
                    handleTempFilterChange("startDate", e.target.value)
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) =>
                    handleTempFilterChange("endDate", e.target.value)
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="teal"
              mr={3}
              onClick={applyFilters}
              leftIcon={<MdFilterList />}
            >
              Apply Filters
            </Button>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                handleClear();
              }}
              leftIcon={<MdClear />}
            >
              Clear Filter
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});
Filters.displayName = "Filters";

export default Filters;
