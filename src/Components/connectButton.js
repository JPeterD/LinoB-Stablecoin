import { Button, Box, Text } from "@chakra-ui/react";
import { useEffect, useState} from 'react';
import 'web3';
import {createWeb3} from './createWeb3.js';
import { AddressTranslator } from 'nervos-godwoken-integration';
import LinoBuxJSON from './../artifacts/contracts/LinoBToken.sol/LinoBux.json';

export default function ConnectButton() {
	const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState();
  const [l2Balance, setL2Balance] = useState();
  const [linoBBalance, setLinoBBalance] = useState();
  const [linoBContract, setLinoBContract] = useState();
  const [polyjuiceAddress, setPolyjuiceAddress] = useState();

  const defaultAccount = accounts?.[0];

  async function triggerWeb3() {
    const web3 = await createWeb3();
    setWeb3(web3);

    const account = [window.ethereum.selectedAddress];
    setAccounts(account);
  }

  async function getTokenBalance() {
      if(!linoBContract && !linoBBalance){
      const _contract = new web3.eth.Contract(LinoBuxJSON.abi, "0xcc2d98FAA13676641E580585AaB2c9D995661428");
      setLinoBContract(_contract);

      const value = await _contract.methods.balanceOf(polyjuiceAddress).call();
      setLinoBBalance(value);
    }
      if(linoBContract && linoBBalance){
      // eslint-disable-next-line no-undef
      const _l2Balance = BigInt(await web3.eth.getBalance(accounts[0]));
      setL2Balance(_l2Balance);

      const value = await linoBContract.methods.balanceOf(polyjuiceAddress).call();
      setLinoBBalance(value);
    }
  }

  useEffect(() => {
      if (defaultAccount) {
          const addressTranslator = new AddressTranslator();
          setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(defaultAccount));
      } else {
          setPolyjuiceAddress(undefined);
      }
  }, [defaultAccount]);
  
  function copyAddress() {
    navigator.clipboard.writeText(polyjuiceAddress);
  }

  function reloadCopy(){
    copyAddress();
    getTokenBalance();
  }

  useEffect(() => {
      if (web3) {
          return;
      }

      (async () => {
          const _web3 = await createWeb3();
          setWeb3(_web3);

          const _accounts = [window.ethereum.selectedAddress];
          setAccounts(_accounts);
          console.log({ _accounts });

          if (_accounts && _accounts[0]) {
              // eslint-disable-next-line no-undef
              const _l2Balance = BigInt(await _web3.eth.getBalance(_accounts[0]));
              setL2Balance(_l2Balance);
          }
      })();
  });
  const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

	return accounts ? (
  <Box
      display="flex"
      alignItems="center"
      background="gray.700"
      borderRadius="xl"
      py="0"
    >
    <Box px="3">
      <Text color="white" fontSize="md">
        {l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB
         | {linoBBalance ? <>{(linoBBalance / 10e7).toString()} LINOB</> : <LoadingIndicator/>}
      </Text>
      </Box>
      <Button
        bg="gray.800"
        border="1px solid transparent"
        _hover={{
          border: "1px",
          borderStyle: "solid",
          borderColor: "blue.400",
          backgroundColor: "gray.700",
        }}
        borderRadius="xl"
        m="1px"
        px={3}
        height="38px" onClick={reloadCopy}
      >
        <Text color="white" fontSize="md" fontWeight="medium" mr="2">
          {polyjuiceAddress &&
            `${polyjuiceAddress.slice(0, 6)}...${polyjuiceAddress.slice(
              polyjuiceAddress.length - 4,
              polyjuiceAddress.length
            )}`}
        </Text>
      </Button>
    </Box>
  ) : (
    <Button onClick={triggerWeb3}>Connect to a wallet</Button>
  );
}