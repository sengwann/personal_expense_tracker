import { Center, Spinner } from "@chakra-ui/react";

export default function Loading() {
  return (
    <Center height="100vh" bg="#f0f0f0">
      <Spinner size="xl" color="blue.500" />
    </Center>
  );
}
