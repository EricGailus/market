import { DDO, Logger, Metadata } from '@oceanprotocol/lib'
import { TransactionReceipt } from 'web3-core'

import { useEffect, useState } from 'react'
import { useOcean } from '../providers/Ocean'
import { useWeb3 } from '../providers/Web3'
import { getOceanConfig } from '../utils/ocean'

interface UseFaucet {
  airDrop: (amount: string, toAddress?: string) => Promise<TransactionReceipt>
  isLoading: boolean
}

function useFaucet(): UseFaucet {
  const { networkId, accountId, web3Loading } = useWeb3()
  const { connect, ocean, account } = useOcean()
  const [isLoading, setIsLoading] = useState(false)
  var oceanAddress: string

  //
  // Initiate OceanProvider based on user wallet
  //
  useEffect(() => {
    if (web3Loading || !connect) return

    async function initOcean() {
      const config = getOceanConfig(networkId)
      await connect(config)
    }
    initOcean()
  }, [web3Loading, networkId, connect])

  /**
   * Publish an asset. It also creates the datatoken, mints tokens and gives the market allowance
   * @param  {Metadata} asset The metadata of the asset.
   * @param  {PriceOptions}  priceOptions : number of tokens to mint, datatoken weight , liquidity fee, type : fixed, dynamic
   * @param  {ServiceType} serviceType Desired service type of the asset access or compute
   * @param  {DataTokenOptions} dataTokenOptions custom name, symbol and cap for datatoken
   * @return {Promise<DDO>} Returns the newly published ddo
   */
  async function airDrop(
    amount: string,
    toAddress?: string
  ): Promise<TransactionReceipt> {
    //if (!ocean || !account) return null
    setIsLoading(true)

    try {
      const config = getOceanConfig(networkId)
      var oceanAddress = config.oceanTokenAddress
      const dispenserToken = await ocean.OceanDispenser.status(oceanAddress)
      if (!dispenserToken) return

      Logger.log('active ', dispenserToken.active)
      Logger.log('owner ', dispenserToken.owner)
      Logger.log('isMinter ', dispenserToken.isTrueMinter)

      if (!dispenserToken.active) {
        await ocean.OceanDispenser.activate(
          oceanAddress,
          '1000',
          '1000',
          accountId
        )
      }

      if (!dispenserToken.isTrueMinter) {
        await ocean.OceanDispenser.makeMinter(oceanAddress, accountId)
      }

      const response = await ocean.OceanDispenser.dispense(
        oceanAddress,
        accountId,
        amount
      )

      if (!response) {
        Logger.error('Failed at dispense')
      }

      const publishedDate =
        new Date(Date.now()).toISOString().split('.')[0] + 'Z'

      return response
    } catch (error) {
      Logger.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    airDrop,
    isLoading
  }
}

export { useFaucet, UseFaucet }
export default useFaucet
