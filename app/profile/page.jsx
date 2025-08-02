"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useAuth } from "../_Auth/AuthContext";
import { showToast } from "../lib/utils/util";

const ProfileEdit = () => {
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });
  const [passwordVisibility, setPasswordVisibility] = useState({
    old: false,
    new: false,
  });

  // Set email from user on mount
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  // Memoized toggle functions
  const togglePasswordVisibility = useCallback((field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  // Memoized input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Memoized submit handler
  const handleSave = useCallback(
    async (event) => {
      event.preventDefault();
      setLoading(true);

      if (!user) {
        showToast("No user is signed in", "error", toast);
        setLoading(false);
        return;
      }

      try {
        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(
          formData.email,
          formData.oldPassword
        );
        await reauthenticateWithCredential(user, credential);

        // Update password if new password provided
        if (formData.newPassword) {
          await updatePassword(user, formData.newPassword);
          setFormData((prev) => ({
            ...prev,
            oldPassword: "",
            newPassword: "",
          }));
          showToast("Password updated successfully!", "success", toast);
          router.push("/dashboard");
        }
      } catch (error) {
        let errorMessage = error.message;

        // Handle specific error cases
        if (error.code === "auth/wrong-password") {
          errorMessage = "Incorrect current password";
        } else if (error.code === "auth/weak-password") {
          errorMessage = "Password should be at least 6 characters";
        }

        showToast(`Error: ${errorMessage}`, "error", toast);
      } finally {
        setLoading(false);
      }
    },
    [user, formData, toast, router]
  );

  // Memoized form JSX to prevent unnecessary re-renders
  const formContent = useMemo(
    () => (
      <form onSubmit={handleSave}>
        <VStack spacing={4}>
          <FormControl>
            <FormLabel color="#374151">Email</FormLabel>
            <Input name="email" value={formData.email} readOnly bg="gray.100" />
          </FormControl>

          <FormControl>
            <FormLabel color="#374151">Old Password</FormLabel>
            <InputGroup>
              <Input
                name="oldPassword"
                type={passwordVisibility.old ? "text" : "password"}
                minLength={6}
                required
                value={formData.oldPassword}
                placeholder="Old password"
                onChange={handleInputChange}
                bg="gray.100"
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("old")}
                  color="#1E3A8A"
                >
                  {passwordVisibility.old ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel color="#374151">New Password</FormLabel>
            <InputGroup>
              <Input
                name="newPassword"
                type={passwordVisibility.new ? "text" : "password"}
                minLength={6}
                placeholder="New password"
                required
                value={formData.newPassword}
                onChange={handleInputChange}
                bg="gray.100"
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => togglePasswordVisibility("new")}
                  color="#1E3A8A"
                >
                  {passwordVisibility.new ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            colorScheme="blue"
            type="submit"
            isLoading={loading}
            width="100%"
            bg="#1E3A8A"
            _hover={{ bg: "#F97316" }}
            color="white"
          >
            Save Changes
          </Button>
        </VStack>
      </form>
    ),
    [
      formData,
      passwordVisibility,
      loading,
      handleSave,
      handleInputChange,
      togglePasswordVisibility,
    ]
  );

  return (
    <Container
      bg="#F3F4F6"
      minH="100vh"
      maxW="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <Box
        p={10}
        width={["95%", "500px"]}
        maxW="500px"
        mx="auto"
        bg="white"
        borderRadius="md"
        boxShadow="lg"
      >
        <Heading size="md" mb={5} textAlign="center" color="#1E3A8A">
          Edit Profile
        </Heading>
        {formContent}
      </Box>
    </Container>
  );
};

export default ProfileEdit;
