import { ConfigHelper, ConfigHelperConfig, Logger } from '@oceanprotocol/lib'
import contractAddresses from '@oceanprotocol/contracts/artifacts/address.json'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'

export function getOceanConfig(network: string | number): ConfigHelperConfig {
  if (network == '1337' || network === undefined || Number.isNaN(network)) {
    network = 'development'
  }

  const config = new ConfigHelper().getConfig(
    network,
    network === 'polygon' ||
      network === 'moonbeamalpha' ||
      network === 1287 ||
      network === 'bsc' ||
      network === 56 ||
      network === 'gaiaxtestnet' ||
      network === 2021000
      ? undefined
      : process.env.GATSBY_INFURA_PROJECT_ID
  )

  const myConfig = config as ConfigHelperConfig

  if (myConfig !== null && myConfig.subgraphUri === null) {
    myConfig.subgraphUri = 'http://127.0.0.1:9000'
  }

  if (myConfig !== null && (network === 1337 || network === undefined)) {
    config.oceanTokenAddress = '0x3A819b4848FBd48A680303d739daaA2ed46EeF2E'
    config.factoryAddress = '0xE8299CCe89f1B30E1d65Ebb827b784D8900aEf2c'
    config.metadataContractAddress =
      '0x10c1a8a80197b9Aed657bb0F8057c7C89504ABDE'
    config.fixedRateExchangeAddress =
      '0xe8e117260e01482dDFaDFe0960d44097a3a73C49'
    config.poolFactoryAddress = '0x515BF99873534584fF1ae590EaB00Cda1BF10583'
    config.dispenserAddress = '0x7Ac89612A5880Ee7DCB8E01B6b187382471D0716'
  }
  return myConfig
}

export function getDevelopmentConfig(): Partial<ConfigHelperConfig> {
  return {
    factoryAddress: contractAddresses.development?.DTFactory,
    poolFactoryAddress: contractAddresses.development?.BFactory,
    fixedRateExchangeAddress: contractAddresses.development?.FixedRateExchange,
    metadataContractAddress: contractAddresses.development?.Metadata,
    oceanTokenAddress: contractAddresses.development?.Ocean,
    // There is no subgraph in barge so we hardcode the Rinkeby one for now
    subgraphUri: 'http://127.0.0.1:9000'
  }
}

export async function getOceanBalance(
  accountId: string,
  networkId: number,
  web3: Web3
): Promise<string> {
  const minABI = [
    {
      constant: true,
      inputs: [
        {
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'balanceOf',
      outputs: [
        {
          name: 'balance',
          type: 'uint256'
        }
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function'
    }
  ] as AbiItem[]

  try {
    const token = new web3.eth.Contract(
      minABI,
      getOceanConfig(networkId).oceanTokenAddress,
      { from: accountId }
    )
    const result = web3.utils.fromWei(
      await token.methods.balanceOf(accountId).call()
    )
    return result
  } catch (e) {
    Logger.error(`ERROR: Failed to get the balance: ${e.message}`)
  }
}
