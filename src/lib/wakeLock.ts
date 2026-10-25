/**
 * 回测期间保持屏幕常亮。手机一锁屏或切到后台，页面就可能被系统挂起甚至杀掉，
 * 正在等的那道题就断了。不支持的浏览器静默跳过，只是少一层保护。
 */
export function keepScreenAwake(): () => void {
  type Sentinel = { release: () => Promise<void> }
  const wakeLock = (navigator as Navigator & {
    wakeLock?: { request: (type: 'screen') => Promise<Sentinel> }
  }).wakeLock
  if (!wakeLock) return () => {}

  let sentinel: Sentinel | null = null
  let active = true
  const acquire = () => {
    if (!active || document.visibilityState !== 'visible') return
    wakeLock.request('screen').then(
      (lock) => {
        sentinel = lock
      },
      () => {},
    )
  }
  // 切回前台时系统已经收回了锁，要重新申请。
  const onVisible = () => acquire()
  document.addEventListener('visibilitychange', onVisible)
  acquire()

  return () => {
    active = false
    document.removeEventListener('visibilitychange', onVisible)
    void sentinel?.release().catch(() => {})
    sentinel = null
  }
}
