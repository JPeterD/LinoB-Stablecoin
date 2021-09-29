import { PolyjuiceAccounts, PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import Web3 from 'web3';
import { readFile } from 'fs/promises';

import CONFIG from '../src/config.js';

(async () => {
    const LinoBVaultJSON = JSON.parse(
        await readFile(
            new URL('../src/artifacts/contracts/LinoBVault.sol/LinoBVault.json', import.meta.url)
        )
    );

    const LinoBuxJSON = JSON.parse(
        await readFile(
            new URL('../src/artifacts/contracts/LinoBToken.sol/LinoBux.json', import.meta.url)
        )
    );

    const DEFAULT_SEND_OPTIONS = {
        gas: 1000000,
        gasPrice: 0
      };


    const providerConfig = {
        web3Url: CONFIG.HTTP_RPC_URL
    };

    const provider = new PolyjuiceHttpProvider(providerConfig.web3Url, providerConfig);

    const polyjuiceAccounts = new PolyjuiceAccounts(providerConfig);

    const web3 = new Web3(provider);
    web3.eth.accounts = polyjuiceAccounts;
    web3.eth.Contract.setProvider(provider, web3.eth.accounts);

    const USER_ONE = web3.eth.accounts.wallet.add(CONFIG.USER_ONE_PRIVATE_KEY);

    const tokenContract = new web3.eth.Contract(LinoBuxJSON.abi, "0x76FebBBE670De113b78858edB2a831A63fB9bB06");

   const myContract = new web3.eth.Contract(LinoBVaultJSON.abi);
    const contractInstance = await myContract
        .deploy({
            data: LinoBVaultJSON.bytecode,
            arguments: []
        })
        .send({
            from: USER_ONE.address
        });

    console.log(`Deployed vault contract: ${contractInstance.options.address}`);

    const ownershipTransfer = await tokenContract.methods.transferOwnership(contractInstance.options.address).send({
              ...DEFAULT_SEND_OPTIONS,
              from: USER_ONE.address
          });
        console.log(`Transfered ownership successfully.`)
})();
