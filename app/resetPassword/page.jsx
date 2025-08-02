"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Box, Button, Input, Text, useToast } from "@chakra-ui/react";
import Loading from "../lib/loading/loading";
import { Suspense } from "react";
import { showToast } from "../lib/utils/util";

// Memoized ForgotPassword component to prevent unnecessary re-renders
const ForgotPassword = memo(() => {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [state, setState] = useState({
    email: "",
    loading: false,
  });

  // Set email from query params on mount
  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setState((prev) => ({ ...prev, email: emailFromQuery }));
    }
  }, [searchParams]);

  // Memoized reset password handler
  const handleResetPassword = useCallback(async () => {
    if (!state.email) {
      showToast("Please enter your email.", "error", toast);
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      await sendPasswordResetEmail(auth, state.email);
      showToast(
        "Password reset email sent! Please check your inbox.",
        "success",
        toast
      );
      setState((prev) => ({ ...prev, email: "", loading: false }));
    } catch (error) {
      let errorMessage = error.message;

      // User-friendly error messages
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address";
      }
      showToast(errorMessage, "error", toast);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.email, toast]);

  // Memoized input change handler
  const handleEmailChange = useCallback((e) => {
    setState((prev) => ({ ...prev, email: e.target.value }));
  }, []);

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt="100px"
      p={4}
      boxShadow="md"
      borderRadius="md"
      bg="white"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="#1E3A8A">
        Reset Password
      </Text>
      <Input
        type="email"
        placeholder="Enter your email"
        value={state.email}
        onChange={handleEmailChange}
        mb={3}
      />
      <Button
        colorScheme="blue"
        onClick={handleResetPassword}
        isLoading={state.loading}
        w="full"
        _hover={{ bg: "#F97316" }}
        loadingText="Sending..."
      >
        Send Reset Link
      </Button>
    </Box>
  );
});
ForgotPassword.displayName = "ForgotPassword";

// Page component remains the same
export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ForgotPassword />
    </Suspense>
  );
}
