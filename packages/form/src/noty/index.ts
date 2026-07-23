let stylesInjected = false

const injectNotyStyles = () => {
  if (stylesInjected) return
  const style = document.createElement('style')
  style.setAttribute('id', 'common-noty-style')
  style.textContent = `
    .common-noty-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .common-noty-toast {
      pointer-events: auto;
      min-width: 240px;
      max-width: 380px;
      padding: 12px 18px;
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(12px);
      color: #ffffff;
      font-size: 14px;
      font-weight: 600;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      transform: translateY(-20px) scale(0.95);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: 1px solid rgba(255, 255, 255, 0.12);
      cursor: pointer;
      user-select: none;
    }

    .common-noty-toast.show {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    .common-noty-toast.hide {
      transform: translateY(-20px) scale(0.95);
      opacity: 0;
    }

    .common-noty-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
    }

    .common-noty-toast.type-error .common-noty-icon {
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      box-shadow: 0 2px 8px rgba(244, 63, 94, 0.4);
    }

    .common-noty-toast.type-warning .common-noty-icon {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    }

    .common-noty-toast.type-info .common-noty-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    }

    .common-noty-message {
      line-height: 1.4;
      flex: 1;
    }
  `
  document.head.appendChild(style)
  stylesInjected = true
}

export type NotyType = 'success' | 'error' | 'warning' | 'info'

export interface NotyFunction {
  (text: string, duration?: number, type?: NotyType): Promise<void>
  success: (text: string, duration?: number) => Promise<void>
  error: (text: string, duration?: number) => Promise<void>
  warning: (text: string, duration?: number) => Promise<void>
  info: (text: string, duration?: number) => Promise<void>
}

export const noty: NotyFunction = Object.assign(
  (text: string, duration = 3000, type: NotyType = 'success'): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof document === 'undefined') {
        resolve()
        return
      }

      injectNotyStyles()

      let container = document.querySelector('.common-noty-container')
      if (!container) {
        container = document.createElement('div')
        container.className = 'common-noty-container'
        document.body.appendChild(container)
      }

      const toast = document.createElement('div')
      toast.className = `common-noty-toast type-${type}`

      const icon = document.createElement('span')
      icon.className = 'common-noty-icon'
      icon.innerHTML = type === 'error' ? '✕' : type === 'warning' ? '!' : type === 'info' ? 'i' : '✓'

      const msg = document.createElement('span')
      msg.className = 'common-noty-message'
      msg.textContent = text

      toast.appendChild(icon)
      toast.appendChild(msg)
      container.appendChild(toast)

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.classList.add('show')
        })
      })

      const removeToast = () => {
        toast.classList.remove('show')
        toast.classList.add('hide')

        const onEnd = () => {
          toast.remove()
          if (container && container.children.length === 0) {
            container.remove()
          }
          resolve()
        }

        toast.addEventListener('transitionend', onEnd, { once: true })
        setTimeout(onEnd, 350)
      }

      const timer = setTimeout(removeToast, duration)

      toast.addEventListener('click', () => {
        clearTimeout(timer)
        removeToast()
      })
    })
  },
  {
    success: (text: string, duration?: number) => noty(text, duration, 'success'),
    error: (text: string, duration?: number) => noty(text, duration, 'error'),
    warning: (text: string, duration?: number) => noty(text, duration, 'warning'),
    info: (text: string, duration?: number) => noty(text, duration, 'info'),
  },
)

export const useNoty = () => noty

export default noty
