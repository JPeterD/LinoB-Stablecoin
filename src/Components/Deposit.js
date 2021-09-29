import { useEffect, useState, useRef} from 'react';
import {toast } from 'react-toastify';
import { Button, Box, Text, Input, InputGroup, InputRightAddon } from "@chakra-ui/react";
import 'web3';
import {createWeb3} from './createWeb3.js'; 
import LinoBVaultJSON from './../artifacts/contracts/LinoBVault.sol/LinoBVault.json';
import LinoBuxJSON from './../artifacts/contracts/LinoBToken.sol/LinoBux.json';

export default function Deposit() {
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const toastId = useRef(null);
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState();

    const [depositAmount, setDepositAmount] = useState();

    const defaultAccount = accounts?.[0];

    useEffect(() => {
      if (transactionInProgress && !toastId.current) {
          toastId.current = toast.info(
              'Transaction in progress. Confirm MetaMask signing dialog and please wait...',
              {
                  position: 'top-right',
                  autoClose: false,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  closeButton: false
              }
          );
      } else if (!transactionInProgress && toastId.current) {
          toast.dismiss(toastId.current);
          toastId.current = null;
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionInProgress, toastId.current]);


const DEFAULT_SEND_OPTIONS = {
    gas: 1000000,
    gasPrice: 0
  };



    async function depositFunds() {
      try {
          setTransactionInProgress(true);
          const depositValue = web3.utils.toBN(depositAmount);

          const contract = new web3.eth.Contract(LinoBVaultJSON.abi, "0x896C957502B905d89AC08279D192180FAA72fAc5");

          await contract.methods.deposit().send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount,
              value: depositValue
          });
          toast(
              'Successfully deposited to the contract. Refresh your Balance.',
              { type: 'success' }
          );
      } catch (error) {
          console.error(error);
          toast.error(
              'There was an error sending your transaction. Please check developer console.'
          );
      } finally {
          setTransactionInProgress(false);
      }
  }

  async function approveContract() {
      try {
          setTransactionInProgress(true);
          const _contract = new web3.eth.Contract(LinoBuxJSON.abi, "0x76FebBBE670De113b78858edB2a831A63fB9bB06");
          const contract = new web3.eth.Contract(LinoBVaultJSON.abi, "0x896C957502B905d89AC08279D192180FAA72fAc5");

          await _contract.methods.approve(contract?.options.address, 1000000000000).send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount
          });
          toast(
              'Successfully approved spending from the contract.',
              { type: 'success' }
          );
      } catch (error) {
          console.error(error);
          toast.error(
              'There was an error sending your transaction. Please check developer console.'
          );
      } finally {
          setTransactionInProgress(false);
      }
  }

  async function withdrawFunds() {
      try {
          setTransactionInProgress(true);
          const contract = new web3.eth.Contract(LinoBVaultJSON.abi, "0x896C957502B905d89AC08279D192180FAA72fAc5");

          await contract.methods.withdraw().send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount
          });
          toast(
              'Successfully repaid loan and withdrew collateral.',
              { type: 'success' }
          );
      } catch (error) {
          console.error(error);
          toast.error(
              'There was an error sending your transaction. Please check developer console.'
          );
      } finally {
          setTransactionInProgress(false);
      }
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

      })();
  });
    return (
    	<Box
      maxw = "md"
      alignItems="center"
      flexDirection="center"
      background="gray.700"
      borderRadius="xl"
      p="70"
      overflow="hidden"
    >
    <Box d="flex" alignItems="center">
    <InputGroup size="md">
    <Input type="number" 
    onChange={e => setDepositAmount(parseInt(e.target.value, 10) * 10e7)} 
    placeholder="Enter Deposit Amount" color="white"/>
    <Text color="black">
    <InputRightAddon children="CKB" />
    </Text>
    </InputGroup>
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
        m="10px"
        px={30}
        size="lg"
        height="38px"
        onClick= {depositFunds}>
        <Text color="white">
        Deposit
        </Text>
    </Button>
    </Box>
    <Box d="flex" mt={10} alignItems="center">
    <Box>
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
        ml={5}
        px={3}
        height="38px"
        size="lg"
        onClick={approveContract}
        >
        <Text color="white">
        Approve Contract
        </Text>
    </Button>
    </Box>
    <Box>
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
        ml={5}
        px={3}
        height="38px"
        size="lg"
        onClick={withdrawFunds}
        >
        <Text color="white">
        Withdraw Collateral
        </Text>
    </Button>
    </Box>
    </Box>
    </Box>)
}