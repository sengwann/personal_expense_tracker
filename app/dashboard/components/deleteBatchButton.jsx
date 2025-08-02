"use client";
import {
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Text,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  VStack,
} from "@chakra-ui/react";
import { useState, memo } from "react";
import { showToast } from "@/app/lib/utils/util";
import { MdDelete } from "react-icons/md";

function DeleteBatchButton({ userId, mutateTransactions, isDisabled }) {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onOpen();
  };

  const handleDeleteBatch = async () => {
    if (!userId || !localStartDate || !localEndDate) {
      showToast("Please select a valid date range.", "error", toast);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/transactions/deleteBatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          startDateStr: localStartDate,
          endDateStr: localEndDate,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error("Unexpected server response. Please try again.");
      }

      if (res.ok && data.status === 200) {
        showToast("Batch deleted successfully.", "success", toast);
        mutateTransactions();
        onClose();
      } else {
        console.error("Error occure in Delete operation..");
        showToast(
          data?.error || data?.message || "Delete failed!",
          "error",
          toast
        );
      }
    } catch (err) {
      showToast(`Error deleting batch: ${err.message}`, "error", toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        colorScheme="red"
        w={{ base: "100%", md: "250px" }}
        onClick={handleOpen}
        leftIcon={<MdDelete />}
        isDisabled={isDisabled}
      >
        Delete Batch
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Batch Deletion</ModalHeader>
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text>
                Are you sure you want to delete all transactions in this date
                range?
              </Text>
              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => setLocalStartDate(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => setLocalEndDate(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={handleDeleteBatch}
              isLoading={loading}
              loadingText="Deleting..."
              leftIcon={<MdDelete />}
            >
              Delete
            </Button>
            <Button variant="outline" onClick={onClose} isDisabled={loading}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default memo(DeleteBatchButton);
