import { pb } from '@/lib'
import { fetchWithTimeoutPreferred } from '@/utils'

// PB_CONNECT
export const pbRealtimeSubscribePBCONNECT = (
  callback: (e: unknown) => void
) => {
  return pb.realtime.subscribe(
    'PB_CONNECT',
    (e) => {
      // console.log('PB_CONNECT', e)
      callback(e)
    },
    {
      // timeout为5000
      fetch: fetchWithTimeoutPreferred,
    }
  )
}
