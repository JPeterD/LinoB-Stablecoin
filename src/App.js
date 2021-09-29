import { ToastContainer} from 'react-toastify';
import Layout from './Components/Layout.js';
import ConnectButton from "./Components/connectButton.js"
import { ChakraProvider } from "@chakra-ui/react";
import Navbar from './Components/Navbar.js';
import Deposit from './Components/Deposit.js';
import VaultInfo from './Components/VaultInfo.js';
import Title from './Components/Title.js'
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
      <div>
        <ChakraProvider>
          <Layout>
            <Navbar>
              <Title/>
              <ConnectButton/>
            </Navbar>
            <Deposit/>
            <VaultInfo/>
          </Layout>
        </ChakraProvider>
      <ToastContainer />
      </div>
  );
}