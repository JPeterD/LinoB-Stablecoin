import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { AddressTranslator } from 'nervos-godwoken-integration';
import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Token from './tokenpage.js'
import CONFIG from './config';
import TimeLockJSON from './artifacts/contracts/TimeLock.sol/TimeLock.json';
import LinoBuxJSON from './artifacts/contracts/LinoBToken.sol/LinoBux.json';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

async function createWeb3() {
  // Modern dapp browsers...
  if (window.ethereum) {
      const providerConfig = {
          web3Url: CONFIG.HTTP_RPC_URL
      };

      const provider = new PolyjuiceHttpProvider(CONFIG.HTTP_RPC_URL, providerConfig);
      const web3 = new Web3(provider || Web3.givenProvider);

      try {
          // Request account access if needed
          await window.ethereum.enable();
      } catch (error) {
          // User denied account access...
      }

      return web3;
  }

  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  return null;
}

export default function App() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState();
  const [tokenContract, setTokenContract] = useState();
  const [accounts, setAccounts] = useState();
  const [l2Balance, setL2Balance] = useState();
  const [depositAmount, setDepositAmount] = useState();
  const [existingContractIdInputValue, setExistingContractIdInputValue] = useState();
  const [existingTokenContractIdInputValue, setExistingTokenContractIdInputValue] = useState();
  const [polyjuiceAddress, setPolyjuiceAddress] = useState();
  const [transactionInProgress, setTransactionInProgress] = useState(false);
  const toastId = useRef(null);

  const defaultAccount = accounts?.[0];

  const DEFAULT_SEND_OPTIONS = {
    gas: 1000000,
    gasPrice: 0
  };

//   async function getLayer2DepositAddress() {
//     const addressTranslator = new AddressTranslator();
//     const depositAddress = await addressTranslator.getLayer2DepositAddress(web3, defaultAccount);

//     console.log(`Layer 2 Deposit Address on Layer 1: \n${depositAddress.addressString}`);
//   }

  useEffect(() => {
      if (defaultAccount) {
          const addressTranslator = new AddressTranslator();
          setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(defaultAccount));
      } else {
          setPolyjuiceAddress(undefined);
      }
  }, [defaultAccount]);

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

  async function deployContract() {
      let _contract = new web3.eth.Contract(TimeLockJSON.abi);

      try {
          setTransactionInProgress(true);

          _contract = await _contract
            .deploy({
                data: TimeLockJSON.bytecode,
                arguments: []
            })
            .send({
                from: defaultAccount
            });

          setExistingContractAddress(_contract.options.address);
          toast(
              'Successfully deployed a smart-contract. You can now proceed to get or set the value in a smart contract.',
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

  async function deployTokenContract() {
      let _contract = new web3.eth.Contract(LinoBuxJSON.abi);

      try {
          setTransactionInProgress(true);

          _contract = await _contract
            .deploy({
                data: LinoBuxJSON.bytecode,
                arguments: []
            })
            .send({
                from: defaultAccount
            });
          setExistingTokenContractAddress(_contract.options.address);
          toast(
              'Successfully deployed a token smart-contract. You can now proceed to get or set the value in a smart contract.',
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

    async function depositFunds() {
      try {
          setTransactionInProgress(true);
          const depositValue = web3.utils.toBN(depositAmount);

          await contract.methods.deposit().send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount,
              value: depositValue
          });
          toast(
              'Successfully deposited to the contract. Please wait 1 minute',
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
          await contract.methods.withdraw().send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount
          });
          toast(
              'Successfully withdrew from the contract.',
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

  async function setExistingContractAddress(contractAddress) {
      const _contract = new web3.eth.Contract(TimeLockJSON.abi, contractAddress);

      setContract(_contract);
  }

  async function setExistingTokenContractAddress(contractAddress) {
      const _contract = new web3.eth.Contract(LinoBuxJSON.abi, contractAddress);

      setTokenContract(_contract);
  }

  async function approveContract() {
      try {
          setTransactionInProgress(true);
          await tokenContract.methods.approve(existingTokenContractIdInputValue, 1000000000000).send({
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

  return (
      <div>
      <Token />
      <br />
        Deployed contract address: <b>{contract?.options.address || '-'}</b> <br />
      <br />
      <br />
      <br />
      Nervos Layer 2 balance:{' '}
      <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
      <br />
      <br />
      <button onClick={deployContract} disabled={!l2Balance}>
        Deploy contract
      </button>
        &nbsp;or&nbsp;
      <input
          placeholder="Existing contract id"
          onChange={e => setExistingContractIdInputValue(e.target.value)}
      />
      <button
        disabled={!existingContractIdInputValue || !l2Balance}
        onClick={() => setExistingContractAddress(existingContractIdInputValue)}
      >
        Use existing contract
      </button>
      <br />
      <br />
      <input
        type="number"
        onChange={e => setDepositAmount(parseInt(e.target.value, 10) * 10e7)}
      /> &nbsp;CKB&nbsp;
      <button onClick={depositFunds} disabled={!contract}>
        Deposit Funds
      </button>
      <br />
      <br />
      <br />
      <br />
      <input
        placeholder="Set Token Contract Address"
        onChange={e => setExistingTokenContractIdInputValue(e.target.value)}
      />
      <button
        onClick={() => setExistingTokenContractAddress(existingTokenContractIdInputValue)}
      >
        Use token contract
      </button>
      <br />
      <br />
      <button onClick={approveContract} disabled={!tokenContract}>
      Approve Contract
      </button>
      <br />
      <br />
      <button onClick={withdrawFunds} disabled={!contract}>
        Withdraw Funds
      </button>
      <ToastContainer />
      </div>
  );
}