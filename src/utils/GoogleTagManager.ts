import { getDataLayerSnippet, getGTMScript, getIframeSnippet } from './snippets'
import { ISendToGTM, ISetupGTM, ISnippetsParams } from '../models/GoogleTagManager'

/**
 * Function to setup the Google Tag Manager
 * @param params - The snippets params
 */
const setupGTM = (params: ISnippetsParams): ISetupGTM => {
  const getDataLayerScript = (): HTMLElement => {
    const dataLayerScript = document.createElement('script')
    dataLayerScript.innerHTML = getDataLayerSnippet(params.dataLayer, params.dataLayerName)
    return dataLayerScript
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
    getDataLayerScript,
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
export const initGTM = ({ dataLayer, dataLayerName, environment, id }: ISnippetsParams): HTMLElement => {
  const gtm = setupGTM({
    dataLayer,
    dataLayerName,
    environment,
    id
  })

  const dataLayerScript = gtm.getDataLayerScript()
  const script = gtm.getScript()
  const noScript = gtm.getNoScript()

  document.head.insertBefore(script, document.head.childNodes[0])
  document.head.insertBefore(dataLayerScript, document.head.childNodes[0])
  document.body.insertBefore(noScript, document.body.childNodes[0])

  return dataLayerScript
}

/**
 * Function to send the events to the GTM
 * @param dataLayerName - The dataLayer name
 * @param data - The data to push
 */
export const sendToGTM = ({ dataLayerName, data }: ISendToGTM): void => window[dataLayerName].push(data)
