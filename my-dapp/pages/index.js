import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import Web3Modal from "web3modal";
import { Contract, providers } from 'ethers';
import { WHITELIST_CONTRACT_ADDRESS, abi } from '@/constants/constants';

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [joinedWHitelist, setJoinedWhitelist] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
  const [loading, setloading] = useState(false);
  const web3ModalRef = useRef();

  const getProviderOrSigner = async(needSigner = false) =>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    
    const {chainId} = await web3Provider.getNetwork();
    if(chainId!=5){
      window.alert("Change the network to Goerli");
      throw new Error("CHange network to Goerli");
    }

    if(needSigner){
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  }

  const checkIfAddressInWhitelist = async()=>{
    try{
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const address = await signer.getAddress();
      const _joinedWhitelist = await whitelistContract.whiteListedAddresses(
        address
      );
      setJoinedWhitelist(_joinedWhitelist);
      
    }catch(err){
      console.error(err);
    }
  };
 
  const getNumberOfWhitelisted = async()=>{
    try{
      const provider = await getProviderOrSigner();
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        provider
      );
      const _numberOfWhitelisted = await whitelistContract.whiteListed();
      setNumberOfWhitelisted(_numberOfWhitelisted);
    }catch(err){
      console.error(err);
    }
  };
  
  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnected(true);
      
      checkIfAddressInWhitelist();
      getNumberOfWhitelisted();

    }catch(err){
      console.error(err);
    }
  };

  const addAddressToWhiteList = async() =>{
    try{
      const signer = await getProviderOrSigner(true);
      const whitelistContract = new Contract(
        WHITELIST_CONTRACT_ADDRESS,
        abi,
        signer
      );
      const tx = await whitelistContract.addWhiteList();
      setloading(true);
      await tx.wait();
      setloading(false);

      await getNumberOfWhitelisted();
      setJoinedWhitelist(true);
    }catch(err){
      console.error(err);
    }
  }

  // Connecting a wallet using web3 modal
  useEffect(()=>{
    if(!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }

  }, [walletConnected]);
  
  
  const renderButton =()=>{
    if(walletConnected){
      if(joinedWHitelist){
        return (
          <div className={styles.description}>
            Thanks for Joining the WhiteList!
          </div>
        );
      }
      else if(loading){
        return <button className={styles.button}>Loading...</button>
      }
      else{
        return(
          <button onClick={addAddressToWhiteList} className={styles.button}>
            Join The Whitelist
          </button>
        )
      }
    }else{
      return(
        <button onClick={connectWallet} className={styles.button}>
          Connect Your Wallet
        </button>
      );
    }
  };
  
  return (
    <div>
      <Head>
        <title>Whitelist Dapp</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
          <div className={styles.description}>
            {/* Using HTML Entities for the apostrophe */}
            It&#39;s an NFT collection for developers in Crypto.
          </div>
          <div className={styles.description}>
            {numberOfWhitelisted} have already joined the Whitelist
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
