import { Flex } from "@chakra-ui/react";

export default function Layout({ children }) {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      h="100vh"
      bg="gray.800"
    >
   {children}
    </Flex>
  )
}