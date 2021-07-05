import React, { ReactElement, useState, useEffect } from 'react'
import { useField } from 'formik'
import { toast } from 'react-toastify'
import ProviderInput from './Input'
import { useOcean } from '../../../../providers/Ocean'
import { InputProps } from '../../../atoms/Input'
import { Provider } from '@oceanprotocol/lib'

export default function CustomProvider(props: InputProps): ReactElement {
  const [field, meta, helpers] = useField(props.name)
  const [isLoading, setIsLoading] = useState(false)
  const [providerUrl, setProviderUrl] = useState<string>()
  const { config } = useOcean()

  function loadProvider() {
    async function validateProvider() {
      try {
        setIsLoading(true)
        const instance = new Provider()
        const valid = await instance.setBaseUrl('test')
        console.log('valid', valid)
      } catch (error) {
        toast.error(
          'Could not validate provider. Please check URL and try again'
        )
        console.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    validateProvider()
  }

  useEffect(() => {
    loadProvider()
  }, [providerUrl, config.providerUri])

  async function handleButtonClick(e: React.SyntheticEvent, url: string) {
    // hack so the onBlur-triggered validation does not show,
    // like when this field is required
    helpers.setTouched(false)

    // File example 'https://oceanprotocol.com/tech-whitepaper.pdf'
    e.preventDefault()

    // In the case when the user re-add the same URL after it was removed (by accident or intentionally)
    if (providerUrl === url) {
      loadProvider()
    }

    setProviderUrl(url)
  }

  return (
    <ProviderInput
      {...props}
      {...field}
      isLoading={isLoading}
      handleButtonClick={handleButtonClick}
    />
  )
}
