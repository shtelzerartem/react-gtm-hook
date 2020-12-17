import { getGTMScript, getIframeSnippet } from './snippets'
import { ISendToGTM, ISetupGTM, ISnippetsParams } from '../models/GoogleTagManager'

/**
 * Function to setup the Google Tag Manager
 * @param params - The snippets params
 */
const setupGTM = (params: ISnippetsParams): ISetupGTM => {
  const setDataLayer = (): void => {
    const dataLayer = params.dataLayer
    const dataLayerName = params.dataLayerName || 'dataLayer'

    window[dataLayerName] = window[dataLayerName] || []
    window[dataLayerName].push(JSON.stringify(dataLayer))
  }

  const getNoScript = (): HTMLElement => {
    const noScript = document.createElement('noscript')
    noScript.innerHTML = getIframeSnippet(params.id, params.environment)
    return noScript
  }

  const getScript = (): HTMLElement => {
    const script = document.createElement('script')
    script.innerHTML = getGTMScript(params.dataLayerName, params.id, params.environment)
    return script
  }

  return {
    setDataLayer,
    getNoScript,
    getScript
  }
}

/**
 * Function to init the GTM
 * @param dataLayer - The dataLayer
 * @param dataLayerName - The dataLayer name
 * @param environment - Specify the custom environment to use
 * @param id - The ID of the GTM
 */
export const initGTM = ({ dataLayer, dataLayerName, environment, id }: ISnippetsParams): void => {
  const gtm = setupGTM({
    dataLayer,
    dataLayerName,
    environment,
    id
  })

  gtm.setDataLayer()

  const script = gtm.getScript()
  const noScript = gtm.getNoScript()

  document.head.insertBefore(script, document.head.childNodes[0])
  document.body.insertBefore(noScript, document.body.childNodes[0])
}

/**
 * Function to send the events to the GTM
 * @param dataLayerName - The dataLayer name
 * @param data - The data to push
 */
export const sendToGTM = ({ dataLayerName, data }: ISendToGTM): void => window[dataLayerName].push(data)
