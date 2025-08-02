"use client";

import { useState, useCallback, useMemo } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { showToast } from "../lib/utils/util";
import {
  Container,
  VStack,
  Box,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Button,
  Text,
  Link,
  useToast,
  InputRightElement,
  InputGroup,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import NextLink from "next/link";

export default function LogInForm() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Memoized input change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoized error messages
  const errorMessages = useMemo(
    () => ({
      "auth/invalid-credential": "Incorrect Email or Password.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/network-request-failed": "Network error. Check your connection.",
      "auth/too-many-requests": "Too many failed attempts. Try again later.",
    }),
    []
  );

  // Memoized login handler
  const handleLogIn = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);

      const { email, password } = credentials;

      if (!email.trim() || password.length < 6) {
        showToast("Invalid email or password.", "error", toast);
        setLoading(false);
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        setCredentials({ email: "", password: "" });
        showToast("Login successful!", "success", toast);
        router.push("/dashboard");
      } catch (error) {
        showToast(
          errorMessages[error.code] || "An unknown error occurred.",
          "error",
          toast
        );
      } finally {
        setLoading(false);
      }
    },
    [credentials, toast, router, errorMessages]
  );

  // Memoized password toggle handler
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  // Memoized reset password link
  const resetPasswordLink = useMemo(
    () => `/resetPassword?email=${encodeURIComponent(credentials.email)}`,
    [credentials.email]
  );

  return (
    <Container
      bg="#F3F4F6"
      maxW="none"
      p="4"
      width="100%"
      centerContent
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <VStack
        spacing={3}
        p={6}
        bg="white"
        width={["90%", "400px", "500px"]}
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
      >
        <Heading fontWeight="400" size="lg" mb={6} color="#1E3A8A">
          Sign In
        </Heading>
        <form onSubmit={handleLogIn} style={{ width: "100%" }}>
          <Box>
            <FormControl>
              <FormLabel htmlFor="email" fontWeight="normal" color="#374151">
                Email
              </FormLabel>
              <Input
                id="email"
                name="email"
                type="email"
                bg="gray.200"
                placeholder="Enter email..."
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel htmlFor="password" fontWeight="normal" color="#374151">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  bg="gray.200"
                  placeholder="Enter password..."
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Toggle password visibility"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={togglePasswordVisibility}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
          <Button
            bg="#1E3A8A"
            color="white"
            _hover={{ bg: "#F97316" }}
            mt={4}
            width="100%"
            type="submit"
            isLoading={loading}
          >
            Login
          </Button>
        </form>
        <Text fontSize="sm" color="#374151">
          Don&apos;t have an account?{" "}
          <Link as={NextLink} color="#F97316" href="/signUp">
            Sign Up
          </Link>
        </Text>
        <Text fontSize="sm">
          <Link as={NextLink} color="#F97316" href={resetPasswordLink}>
            Forgot password?
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
