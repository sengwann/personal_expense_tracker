"use client";

import { useState, useCallback, useMemo } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { showToast } from "../lib/utils/util";
import {
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Button,
  FormErrorMessage,
  useToast,
  Text,
  Link,
  Spinner,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // Memoized error messages
  const errorMessages = useMemo(
    () => ({
      "auth/email-already-in-use":
        "This email is already registered. Try logging in.",
      "auth/invalid-email": "This email address is not valid.",
      "auth/weak-password":
        "The password is too weak. Please use a stronger one.",
    }),
    []
  );

  // Memoized form handlers
  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Validate in real-time
      if (name === "password") {
        setErrors((prev) => ({
          ...prev,
          password:
            value.length < 6
              ? "The password must be at least 6 characters long."
              : "",
        }));
      } else if (name === "confirmPassword") {
        setErrors((prev) => ({
          ...prev,
          confirmPassword:
            value !== formData.password ? "Passwords do not match." : "",
        }));
      }
    },
    [formData.password]
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  // Memoized submit handler
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Reset errors
      setErrors({
        password: "",
        confirmPassword: "",
      });

      // Validate form
      if (
        !formData.email.trim() ||
        !formData.password ||
        !formData.confirmPassword
      ) {
        showToast("Please fill out all fields.", "error", toast);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match.",
        }));
        showToast("Passwords do not match.", "error", toast);
        return;
      }

      if (formData.password.length < 6) {
        setErrors((prev) => ({
          ...prev,
          password: "The password must be at least 6 characters long.",
        }));
        return;
      }

      setLoading(true);

      try {
        await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        setFormData({ email: "", password: "", confirmPassword: "" });
        showToast("We've created your account for you.", "success", toast);
        router.push("/login");
      } catch (err) {
        showToast(
          errorMessages[err.code] || `Unexpected error: ${err.message}`,
          "error",
          toast
        );
      } finally {
        setLoading(false);
      }
    },
    [formData, toast, router, errorMessages]
  );

  return (
    <Container
      bg="#F3F4F6"
      p={4}
      maxW="none"
      width="100%"
      centerContent
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <VStack
        spacing={3}
        align="stretch"
        p={6}
        bg="white"
        width={["90%", "400px", "500px"]}
        maxWidth="500px"
        borderRadius="md"
        boxShadow="md"
      >
        <Heading
          fontWeight="400"
          size="lg"
          textAlign="center"
          mb={6}
          color="#1E3A8A"
        >
          Sign Up
        </Heading>
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
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
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
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
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.password && (
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            )}
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword}>
            <FormLabel
              htmlFor="confirmPassword"
              fontWeight="normal"
              color="#374151"
            >
              Confirm Password
            </FormLabel>
            <InputGroup>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                bg="gray.200"
                placeholder="Confirm password..."
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {errors.confirmPassword && (
              <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            bg="#1E3A8A"
            color="white"
            _hover={{ bg: "#F97316" }}
            mt={4}
            width="100%"
            type="submit"
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm" color="white" /> : "Sign Up"}
          </Button>
        </form>

        <Text fontSize="sm" align="center" color="#374151">
          Already have an account?{" "}
          <Link as={NextLink} href="/login" color="#F97316">
            Login
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
