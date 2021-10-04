import { useEffect, useState} from 'react';
import { Box, Button, Modal, ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton} from "@chakra-ui/react";
import { useDisclosure } from '@chakra-ui/hooks'
import LinoBVaultJSON from './../artifacts/contracts/LinoBVault.sol/LinoBVault.json';
import {createWeb3} from './createWeb3.js';
import 'web3';
import { AddressTranslator } from 'nervos-godwoken-integration';



export default function VaultInfo() {
    const [web3, setWeb3] = useState(null);
    const [accounts, setAccounts] = useState();
    const [loanAmount, setLoanAmount] = useState();
    const [polyjuiceAddress, setPolyjuiceAddress] = useState();
    const [lockedCKB, setLockedCKB] = useState();
    const [ckbRatio, setCKBRatio] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();


    const defaultAccount = accounts?.[0];

    useEffect(() => {
        if (defaultAccount) {
          const addressTranslator = new AddressTranslator();
          setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(defaultAccount));
      } else {
          setPolyjuiceAddress(undefined);
      }
  }, [defaultAccount]);


    async function getDetails() {
          const contract = new web3.eth.Contract(LinoBVaultJSON.abi, "0x896C957502B905d89AC08279D192180FAA72fAc5");

          const value = await contract.methods.stableCoinAmount(polyjuiceAddress).call();
          setLoanAmount(value);

          // eslint-disable-next-line no-undef
          const values = BigInt(await contract.methods.depositAmount(polyjuiceAddress).call());
          setLockedCKB(values);

          const price = await contract.methods.getCKBUSDPrice().call();

          if(values > 0){
          // eslint-disable-next-line no-undef
          const ratio = values * BigInt(price) / BigInt(value) * BigInt(100) / BigInt(10e7);
          setCKBRatio(ratio);
        }
        else {
          setCKBRatio(0);
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
          if (web3) {
              // eslint-disable-next-line no-undef
              getContract();
          }
      })();
  });

  const LoadingIndicator = () => <span className="rotating-icon">⚙️</span>;

	return (
		<Box p={10}>
      <Button onClick={onOpen}>View CKB Vault Details</Button>
      <Modal isOpen={isOpen} onClose={onClose} motionPreset="slideInBottom">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>CKB Vault</ModalHeader>
            <ModalCloseButton />
          <ModalBody>
		      <Box>
		        Minimum Collateral Ratio: 150%
	      	</Box>
          <Box>
          Liquidation Fee: 5%
          </Box>
		        Balance: {loanAmount ? <>{(loanAmount / 10e7).toString()} LINOB</> : <LoadingIndicator/>}
          <Box>
            Locked: {lockedCKB ? (lockedCKB / 10n ** 8n).toString() : 0} CKB
          </Box>
          <Box>
          Your Collateral Ratio: {ckbRatio ? <>&nbsp;{(ckbRatio).toString()}%</> :<>N/A </> }
          </Box>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={getDetails}>
              Load details
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
		</Box>
		)
}