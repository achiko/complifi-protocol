'use strict';

const VaultFactory = artifacts.require("VaultFactory");
const VaultFactoryProxy = artifacts.require("VaultFactoryProxy");
const Vault = artifacts.require("Vault");

const paused = parseInt( process.env.DELAY_MS || "5000" );

const delay = require('delay');
const wait = async (param) => { console.log("Delay " + paused); await delay(paused); return param;};

module.exports = async (done) => {
  const networkType = await web3.eth.net.getNetworkType();
  const networkId = await web3.eth.net.getId();
  const accounts = await web3.eth.getAccounts();
  console.log("network type:" + networkType);
  console.log("network id:" + networkId);
  console.log("accounts:" + accounts);

  let INSTRUMENTS = [];
  if(networkId === 1) {
    INSTRUMENTS = [
      "BTCx5-USDT",
      "InsurETH",
      "StabBTC",
      "CallBTC",
      "CallETH",
      "BTCx5-USDC",
      "ETHx5-USDC",
      "InsurBTC",
      "StabETH",
      "InsurLINK",
      "CallLINK",
      "EURx5-USDC",
      "GBPx5-USDC",
      "JPYx5-USDC",
      "GOLDx5-USDC",
      "N225x5-USDC",
      "FTSEx5-USDC",
      "SynthGAS",
      "ETHx5-USDT",
      "EURx5-USDT",
      "GBPx5-USDT",
      "JPYx5-USDT",
      "GOLDx5-USDT",
      "N225x5-USDT",
      "FTSEx5-USDT",
    ];
  } else {
    INSTRUMENTS = [
      "InsurASSET",
      "CallASSET",
      "ASSETx5",
      "StabASSET",
      "ASSETx1"
    ];
  }

  const vaultFactoryAddress = (await VaultFactoryProxy.deployed()).address;
  const vaultFactory = await VaultFactory.at(vaultFactoryAddress);

  const derivativeCreated = Math.floor(Date.now() / 1000);

  for(const instrument of INSTRUMENTS) {
    try {
      console.log("Creating vault " + instrument + " initialized at " + derivativeCreated);
      await wait(await vaultFactory.createVault(web3.utils.keccak256(instrument), derivativeCreated));
      const lastVaultIndex = await vaultFactory.getLastVaultIndex.call();
      console.log("Vault created index " + lastVaultIndex);
      const vaultAddress = await vaultFactory.getVault.call(lastVaultIndex);
      console.log("Vault created " + vaultAddress);
      try {
        await wait(await (await Vault.at(vaultAddress)).initialize());
      } catch {
        // second try if the first is failed
        await wait(await (await Vault.at(vaultAddress)).initialize());
      }
      console.log("Vault initialized " + vaultAddress);
    } catch(e) {
      console.log(e);
      done();
    }
  }

  done();
};
