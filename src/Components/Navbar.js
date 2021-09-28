import { Flex } from "@chakra-ui/react";

export default function Navbar({ children }) {
  return (
    <Flex
      flexDirection="column"
      alignItems="flex-end"
      justifyContent="flex-start"
      p="10"
      pl="940"
    >
   {children}
    </Flex>
  )
}