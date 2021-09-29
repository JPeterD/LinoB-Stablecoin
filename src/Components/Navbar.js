import { Flex } from "@chakra-ui/react";

export default function Navbar({ children }) {
  return (
    <Flex
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="flex-start"
      p="5"
      mb="10"
      pb="0"
      pl="910"
      bg="gray.600"
      w="100vw"
    >
   {children}
    </Flex>
  )
}