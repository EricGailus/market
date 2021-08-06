import React, { ReactElement } from 'react'

import { useWeb3 } from '../../../providers/Web3'

import { getNetworkDataById, getNetworkDisplayName } from '../../../utils/web3'
import useNetworkMetadata from '../../../hooks/useNetworkMetadata'

import Button from '../../atoms/Button'
import styles from './Appearance.module.css'
import FormHelp from '../../atoms/Input/Help'
import Label from '../../atoms/Input/Label'

import { Logger } from '@oceanprotocol/lib'
import useFaucet from '../../../hooks/useFaucet'

export default function Faucet(): ReactElement {
  const { networkId, web3Provider, accountId } = useWeb3()
  const { networksList } = useNetworkMetadata()
  const networkData = getNetworkDataById(networksList, networkId)
  const networkName = getNetworkDisplayName(networkData, networkId)
  const { airDrop } = useFaucet()

  async function handleAddToken() {
    if (!web3Provider || !accountId) return

    const transactionReceipt = await airDrop('10', accountId)
    Logger.log(transactionReceipt)
  }

  return (
    <li className={styles.appearances}>
      <Label htmlFor="">Ocean Faucet</Label>
      <span className={styles.name}>on Network: {networkName}</span>
      <Button style="text" onClick={handleAddToken}>
        Air drop OCEAN
      </Button>
      <FormHelp>Add 10 Ocean to this address.</FormHelp>
    </li>
  )
}
