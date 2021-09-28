import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import CONFIG from './../config';

export const createWeb3 = () =>
	new Promise(async(resolve, reject) => {
	if (window.ethereum) {
      const providerConfig = {
          web3Url: CONFIG.HTTP_RPC_URL
      };

      const provider = new PolyjuiceHttpProvider(CONFIG.HTTP_RPC_URL, providerConfig);
      const web3 = new Web3(provider || Web3.givenProvider);

      try {
          // Request account access if needed
          await window.ethereum.enable();
          resolve(web3);
      } catch (error) {
          // User denied account access...
          reject(error);
      }
  }
  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  return null;
	})