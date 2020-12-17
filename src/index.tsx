import React, { Context, ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'
import { initGTM, sendToGTM } from './utils/GoogleTagManager'

import { ISnippetsParams } from './models/GoogleTagManager'

declare global {
  interface Window {
    dataLayer: Object | undefined
    [key: string]: any
  }
}

/**
 * The shape of the context provider
 */
type GTMHookProviderProps = { state?: any; children: ReactNode }

/**
 * The shape of the hook
 */
export type IUseGTM = {
  init({ dataLayer, dataLayerName, id }: ISnippetsParams): void
  sendDataToGTM(data: Object): void
  UseGTMHookProvider: ({ children }: GTMHookProviderProps) => JSX.Element
  useGTMHookContext: Context<ISnippetsParams | undefined>
}

/**
 * The initial state
 */
export const initialState: ISnippetsParams = {
  dataLayer: undefined,
  dataLayerName: 'dataLayer',
  environment: undefined,
  id: ''
}

/**
 * The context
 */
const useGTMHookContext = createContext<ISnippetsParams | undefined>(initialState)

/**
 * A provider for testing purpose only
 */
export const TestingProvider = ({ state, children }: GTMHookProviderProps) => (
  <useGTMHookContext.Provider value={state}>{children}</useGTMHookContext.Provider>
)

/**
 * The Google Tag Manager Hook
 */
export default function useGTM(): IUseGTM {
  const [dataLayerState, setDataLayerState] = useState(initialState)
  const [cachedState, setCachedState] = useState<any[] | never>([])
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const gtmContextState = useContext(useGTMHookContext)

  const init = useCallback(
    (snippetParams: ISnippetsParams): void =>
      setDataLayerState(state => ({
        ...state,
        ...snippetParams
      })),
    [setDataLayerState]
  )

  useEffect(() => {
    if (dataLayerState.id !== '') {
      const dataLayerScript = initGTM({
        dataLayer: dataLayerState.dataLayer,
        dataLayerName: dataLayerState.dataLayerName,
        environment: dataLayerState.environment,
        id: dataLayerState.id
      })
      dataLayerScript.onload = () => {
        setScriptLoaded(true)
      }
    }
  }, [dataLayerState])

  const UseGTMHookProvider = ({ children }: GTMHookProviderProps) => (
    <useGTMHookContext.Provider value={dataLayerState}>{children}</useGTMHookContext.Provider>
  )

  useEffect(() => {
    if (dataLayerState.id !== '') {
      const dataLayerScript = initGTM({
        dataLayer: dataLayerState.dataLayer,
        dataLayerName: dataLayerState.dataLayerName,
        environment: dataLayerState.environment,
        id: dataLayerState.id
      })
      dataLayerScript.onload = () => {
        setScriptLoaded(true)
      }
    }
  }, [dataLayerState])

  const restoreCache = useCallback((): void => {
    for (const data of cachedState) {
      sendToGTM({ data, dataLayerName: gtmContextState?.dataLayerName! })
    }
  }, [gtmContextState, cachedState])

  useEffect(() => {
    if (scriptLoaded) restoreCache()
  }, [scriptLoaded, restoreCache])

  const sendDataToGTM = useCallback(
    (data: Object): void => {
      if (scriptLoaded) sendToGTM({ data, dataLayerName: gtmContextState?.dataLayerName! })
      else {
        setCachedState([...cachedState, data])
      }
    },
    [gtmContextState, cachedState, scriptLoaded]
  )

  return {
    init,
    sendDataToGTM,
    UseGTMHookProvider,
    useGTMHookContext
  }
}
