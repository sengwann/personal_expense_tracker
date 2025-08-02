import { memo, useCallback } from "react";
import {
  Avatar,
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Link,
  Button,
} from "@chakra-ui/react";
import {
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaChartPie,
} from "react-icons/fa";
import { useAuth } from "../../_Auth/AuthContext";
import NextLink from "next/link";

// Memoized NavItem component to prevent unnecessary re-renders
const NavItem = memo(({ icon, label, href }) => (
  <Link
    as={NextLink}
    href={href}
    passHref
    _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
    w="100%"
  >
    <Flex p={3} borderRadius="md" alignItems="center">
      <Icon as={icon} mr={3} />
      <Text>{label}</Text>
    </Flex>
  </Link>
));
NavItem.displayName = "NavItem";

const Sidebar = memo(() => {
  const { user, logout } = useAuth();

  // Memoize logout handler since it's passed to Button onClick
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  return (
    <Box
      bg="#1E3A8A"
      color="white"
      w={["200px", "300px"]}
      p={4}
      h="100vh"
      position="fixed" // IMPORTANT: fixed position
      left="0"
      top="0"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Profile Section */}
      <Flex direction="column" align="center" mb={8}>
        <Avatar
          size="xl"
          name={user?.email}
          src={user?.photoURL} // Add if you have user avatars
        />
        <Text mt={2} fontSize="lg" fontWeight="bold" textAlign="center">
          {user?.email}
        </Text>
      </Flex>

      {/* Navigation Links - Using memoized NavItem */}
      <VStack align="start" spacing={4} w="100%">
        <NavItem icon={FaHome} label="Home" href="#" />
        <NavItem icon={FaUser} label="Profile" href="/profile" />
        <NavItem icon={FaCog} label="Settings" href="#" />
        <NavItem icon={FaChartPie} label="Reports" href="#" />
      </VStack>

      {/* Logout Button */}
      <Button
        leftIcon={<Icon as={FaSignOutAlt} />}
        bg="#F97316"
        color="white"
        _hover={{ bg: "#EA580C" }}
        w="100%"
        onClick={handleLogout}
        mt={6}
      >
        Logout
      </Button>
    </Box>
  );
});
Sidebar.displayName = "Sidebar";

export default Sidebar;
