import { Box, Grid, Text, Image } from "@chakra-ui/react";
import bankIcon from "./../images/bankicon.png"
import debtIcon from "./../images/debtIcon.png"
import { useEffect, useState} from 'react';
import {createWeb3} from './createWeb3.js';
import 'web3';
import LinoBuxJSON from './../artifacts/contracts/LinoBToken.sol/LinoBux.json';

export default function VaultTotals(){
  const [web3, setWeb3] = useState(null);
  const [totalCollat, setTotalCollat] = useState();
  const [totalDebt, setTotalDebt] = useState();

  useEffect(() => {
    if (web3) {
      return;
    }

    (async () => {
      const _web3 = await createWeb3();
      setWeb3(_web3);

      const _accounts = [window.ethereum.selectedAddress];

      if (_accounts && _accounts[0]) {
      // eslint-disable-next-line no-undef
        const _totalCollat = BigInt(await _web3.eth.getBalance("0x896C957502B905d89AC08279D192180FAA72fAc5"));
        setTotalCollat(_totalCollat);

        const _contract = new _web3.eth.Contract(LinoBuxJSON.abi, "0x76FebBBE670De113b78858edB2a831A63fB9bB06");

        const value = await _contract.methods.totalSupply().call();
        setTotalDebt(value);
      }
    })();
  });

  return (
      <Grid templateColumns="repeat(2, 1fr)" gap={400} mt={90}>
        <Box position="absolute" top="94vh" left="20vw" w="22vw" h="15vh" boxShadow="dark-lg" bg="gray.500" borderRadius="xl">

          <Image src={bankIcon} boxSize="75px" mt="10px" ml="5px" alt="Bank"/>
          <Text position="absolute" top="1vh" left="8vw" color="white">
            Total Collateral:
          </Text>
          <Text  fontSize="md" position="absolute" top="9vh" left="9vw" color="white">
          {totalCollat ? (totalCollat / 10n ** 8n).toString() : 0}CKB
          </Text>
        </Box>
        <Box position="absolute" top="94vh" left="67vw" w="22vw" h="15vh" boxShadow="dark-lg" bg="gray.500" borderRadius="xl">
          <Image src={debtIcon} boxSize="100px" mb="10px" ml="5px" alt="debt"/>  
          <Text position="absolute" top="1vh" left="12vw" color="white">
            Total Debt:
          </Text>
          <Text  fontSize="md" position="absolute" top="9vh" left="10vw" color="white">
          {totalDebt ? <>{(totalDebt / 10e7).toString()} LINOB</> : 0}
          </Text>        
        </Box>
      </Grid>
    )
}