"use client";

import {
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Text,
  IconButton,
  HStack,
  Tooltip,
} from "@chakra-ui/react";
import { getSymbol } from "@/app/lib/utils/util";
import { memo, useState, useEffect } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const DisplayBalance = memo(({ mainTotals }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const balance =
    (mainTotals?.totalIncome || 0) - (mainTotals?.totalExpense || 0);
  return (
    <SimpleGrid
      columns={{ base: 1, sm: 2, md: 3 }}
      spacing={{ base: 2, md: 4 }}
      mb={{ base: 4, md: 8 }}
      w="100%"
    >
      <Stat bg="#D1FAE5" p={{ base: 2, md: 4 }} borderRadius="md" minW={0}>
        <StatLabel color="#047857" fontSize={{ base: "sm", md: "md" }}>
          Total Income
        </StatLabel>
        <StatNumber color="#2563EB" fontSize={{ base: "lg", md: "2xl" }}>
          <Text as="span" fontFamily="monospace">
            {showBalance
              ? `${mainTotals?.totalIncome || 0} ${getSymbol(
                  mainTotals?.currency || "THB"
                )}`
              : "*****"}
          </Text>
        </StatNumber>
      </Stat>
      <Stat bg="#FECACA" p={{ base: 2, md: 4 }} borderRadius="md" minW={0}>
        <StatLabel color="#B91C1C" fontSize={{ base: "sm", md: "md" }}>
          Total Expense
        </StatLabel>
        <StatNumber color="#EF4444" fontSize={{ base: "lg", md: "2xl" }}>
          <Text as="span" fontFamily="monospace">
            {showBalance
              ? `${mainTotals?.totalExpense || 0} ${getSymbol(
                  mainTotals?.currency || "THB"
                )}`
              : "*****"}
          </Text>
        </StatNumber>
      </Stat>
      <Stat bg="#DBEAFE" p={{ base: 2, md: 4 }} borderRadius="md" minW={0}>
        <StatLabel color="#1E40AF" fontSize={{ base: "sm", md: "md" }}>
          Balance
        </StatLabel>
        <StatNumber color="#2563EB" fontSize={{ base: "lg", md: "2xl" }}>
          <HStack spacing={2} justify="flex-start">
            {mounted ? (
              <>
                <Text
                  as="span"
                  color="#2563EB"
                  minW={{ base: "80px", md: "120px" }}
                  textAlign="left"
                  fontSize={{ base: "lg", md: "2xl" }}
                  fontFamily="monospace"
                >
                  {showBalance
                    ? `${balance} ${getSymbol(mainTotals?.currency || "THB")}`
                    : "*****"}
                </Text>
                <Tooltip
                  label={showBalance ? "Hide balance" : "Show balance"}
                  placement="top"
                  hasArrow
                >
                  <IconButton
                    aria-label={showBalance ? "Hide balances" : "Show balances"}
                    icon={showBalance ? <ViewOffIcon /> : <ViewIcon />}
                    size={{ base: "sm", md: "md" }}
                    variant="ghost"
                    onClick={() => setShowBalance((prev) => !prev)}
                  />
                </Tooltip>
              </>
            ) : (
              <Text
                as="span"
                color="#2563EB"
                minW={{ base: "80px", md: "120px" }}
                textAlign="right"
                fontSize={{ base: "lg", md: "2xl" }}
                fontFamily="monospace"
              >
                {`${balance} ${getSymbol(mainTotals?.currency || "THB")}`}
              </Text>
            )}
          </HStack>
        </StatNumber>
      </Stat>
    </SimpleGrid>
  );
});
DisplayBalance.displayName = "DisplayBalance";

export default DisplayBalance;
