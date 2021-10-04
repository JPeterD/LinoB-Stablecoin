import { Flex } from "@chakra-ui/react";

export default function Layout({ children }) {
  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      h="115vh"
      bg="gray.800"
    >
   {children}
    </Flex>
  )
}