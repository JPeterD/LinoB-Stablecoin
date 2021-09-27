import { useEffect, useState, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { AddressTranslator } from 'nervos-godwoken-integration';
import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import CONFIG from './config';
import LinoBuxJSON from './artifacts/contracts/LinoBToken.sol/LinoBux.json';
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
}

export default function Token() {
	const [web3, setWeb3] = useState(null);
  	const [tokenContract, setTokenContract] = useState();
  	const [accounts, setAccounts] = useState();
  	const [l2Balance, setL2Balance] = useState();
  	const [mintAmount, setMintAmount] = useState();
  	const [mintToAddress, setMintToAddress] = useState();
    const [tokenBalance, setTokenBalance] = useState();
    const [addressTokenBalance, setAddressTokenBalance] = useState();
    const [newStableContractOwner, setNewStableContractOwner] = useState();
    const [existingTokenContractIdInputValue, setExistingTokenContractIdInputValue] = useState();
  	const [transactionInProgress, setTransactionInProgress] = useState(false);
  	const toastId = useRef(null);

	const DEFAULT_SEND_OPTIONS = {
    	gas: 1000000,
    	gasPrice: 0
  	};

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

    async function setExistingTokenContractAddress(contractAddress) {
      const _contract = new web3.eth.Contract(LinoBuxJSON.abi, contractAddress);

      setTokenContract(_contract);
  }

  async function mintTokens() {
      try {
          setTransactionInProgress(true);
          await tokenContract.methods.mint(mintToAddress, mintAmount).send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount
          });
          toast(
              'Successfully minted tokens.',
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

  async function transferOwnership() {
      try {
          setTransactionInProgress(true);
          await tokenContract.methods.transferOwnership(newStableContractOwner).send({
              ...DEFAULT_SEND_OPTIONS,
              from: defaultAccount
          });
          toast(
              'Successfully set new token contract owner.',
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

  async function getTokenBalance() {
      const value = await tokenContract.methods.balanceOf(addressTokenBalance).call();
      toast('Successfully read address token balance.', { type: 'success' });

      setTokenBalance(value);
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

  return(
  	<div>
  	<br />
  	Deployed token contract address: <b>{tokenContract?.options.address || '-'}</b> <br />
    <br />
    <br />
    <button onClick={deployTokenContract} disabled={!l2Balance}>
        Deploy Token
    </button>
        &nbsp;or&nbsp;
      <input
          placeholder="Existing coin contract Address"
          onChange={e => setExistingTokenContractIdInputValue(e.target.value)}
      />
      <button
        disabled={!existingTokenContractIdInputValue || !l2Balance}
        onClick={() => setExistingTokenContractAddress(existingTokenContractIdInputValue)}
      >
        Use existing contract
      </button>
      <br />
      <br />
    <br />
    Nervos Layer 2 balance:{' '}
    <b>{l2Balance ? (l2Balance / 10n ** 8n).toString() : <LoadingIndicator />} CKB</b>
    <br />
    <br />
    <input
      placeholder=" Token Contract Owner"
      onChange={e => setNewStableContractOwner(e.target.value)}
    />
    <button
      onClick={transferOwnership}
    >
      Transfer Ownership
    </button>
    <br />
    <br />
    <input
      placeholder="Address Balance"
      onChange={e => setAddressTokenBalance(e.target.value)}
    />
    <button
      onClick={getTokenBalance}
    >
      Get Token Balance
    </button>
    {tokenBalance ? <>&nbsp;&nbsp;Token Balance: {tokenBalance.toString()}</> : null} LINOB
    <hr />    
  	<ToastContainer/>
  	</div>);

}