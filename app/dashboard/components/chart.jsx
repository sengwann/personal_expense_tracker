"use client";

import { memo } from "react";
import { Box, Flex, Heading, VStack } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import { palette } from "@/app/lib/utils/util";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Chart = memo(({ chartData }) => {
  // Expense vs Income
  const expenseIncomeOptions = {
    chart: { type: "donut" },
    labels: ["Income", "Expense"],
    colors: ["#2563EB", "#F97316"],
  };
  const expenseIncomeSeries = [chartData.income || 0, chartData.expense || 0];

  // Expense by Category
  let expenseCategoryLabels = Object.keys(chartData.expenseByCategory || {});
  let expenseCategorySeries = expenseCategoryLabels.map(
    (cat) => chartData.expenseByCategory[cat] ?? 0
  );

  // Handle single filtered category
  if (
    (!expenseCategoryLabels.length ||
      expenseCategorySeries.every((v) => v === 0)) &&
    chartData.expense > 0 &&
    chartData.category
  ) {
    expenseCategoryLabels = [chartData.category];
    expenseCategorySeries = [chartData.expense];
  }

  const hasCategoryData =
    expenseCategoryLabels.length > 0 &&
    expenseCategorySeries.some((v) => v > 0);

  // If no transactions, show empty state
  const hasData = expenseIncomeSeries.some((v) => v > 0);
  const expenseCategoryOptions = {
    chart: { type: "donut" },
    labels: expenseCategoryLabels,
    colors: palette.slice(0, expenseCategoryLabels.length),
  };
  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justifyContent="center"
      alignItems="flex-start"
      mt={8}
      gap={8}
      px={{ base: 2, md: 4 }}
    >
      <VStack
        w={{ base: "100%", md: "50%" }}
        spacing={4}
        maxW="600px"
        mx="auto"
      >
        <Heading size="md" color="#1E3A8A" textAlign="center">
          Expense vs Income
        </Heading>
        <Box
          bg="white"
          p={{ base: 2, md: 4 }}
          borderRadius="md"
          w="full"
          overflowX="auto"
          height="305px"
        >
          {hasData ? (
            <ApexChart
              options={expenseIncomeOptions}
              series={expenseIncomeSeries}
              type="donut"
              width="100%"
            />
          ) : (
            <Box textAlign="center" color="gray.500" py={8} height="100%">
              No transactions data
            </Box>
          )}
        </Box>
      </VStack>

      <VStack
        w={{ base: "100%", md: "50%" }}
        spacing={4}
        maxW="600px"
        mx="auto"
      >
        <Heading size="md" color="#1E3A8A" textAlign="center">
          Expense Category Breakdown
        </Heading>
        <Box
          bg="white"
          p={{ base: 2, md: 4 }}
          borderRadius="md"
          w="full"
          height="305px"
          overflowX="auto"
        >
          {hasCategoryData ? (
            <ApexChart
              options={expenseCategoryOptions}
              series={expenseCategorySeries}
              type="donut"
              width="100%"
            />
          ) : (
            <Box textAlign="center" color="gray.500" py={8} height="100%">
              No expense category data
            </Box>
          )}
        </Box>
      </VStack>
    </Flex>
  );
});

Chart.displayName = "Chart";

export default Chart;
