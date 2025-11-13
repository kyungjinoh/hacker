import { useEffect, useRef, useState } from 'react'
import './App.css'
import celebrationGif from './assets/67.gif'

const DOWNLOAD_MESSAGES = [
  'initializing payload...',
  'connecting to command server...',
  'downloading worm.exe (12 KB/s)',
  'failed checksum: retrying...',
  'downloading worm.exe (7 KB/s)',
  'extracting payload...',
  'running rootkit installer...',
  'uploading credentials.txt',
  'modifying registry keys...',
  'deploying persistence module...',
  'phoning home...',
  'injecting into explorer.exe',
  'bricking security services...',
  'launching crypto miner...',
  'collecting keystrokes...',
  'encrypting documents...',
  'hiding tracks...',
  'cleanup complete.'
]

const generateReferralId = () => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(5)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('').slice(0, 8)
  }

  return Math.random().toString(36).slice(2, 10)
}

const encodeMessage = (message) => {
  try {
    const base64 = btoa(unescape(encodeURIComponent(message)))
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  } catch (error) {
    return ''
  }
}

const decodeMessage = (encoded) => {
  try {
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const padded =
      normalized.length % 4 === 0 ? normalized : normalized + '='.repeat(4 - (normalized.length % 4))
    return decodeURIComponent(escape(atob(padded)))
  } catch (error) {
    return null
  }
}

const DEFAULT_MESSAGE = 'Haha bro u fell in to my prank'

const SharingControls = ({
  labelId,
  className = '',
  message,
  onMessageChange,
  copyStatus,
  handleCopyLink,
  displayUrl,
  messageLabel = 'Edit prank message',
  linkFirst = false
}) => {
  const linkRow = (
    <div className="notice-link-row share-link-row">
      <code className="notice-link">{displayUrl || 'Generating share link...'}</code>
      <button className="notice-button" onClick={handleCopyLink}>
        {copyStatus}
      </button>
    </div>
  )

  const messageField = (
    <div className="notice-message-field">
      <label htmlFor={labelId}>{messageLabel}</label>
      <input
        id={labelId}
        type="text"
        maxLength={90}
        placeholder={DEFAULT_MESSAGE}
        value={message}
        onChange={(event) => onMessageChange(event.target.value)}
      />
    </div>
  )

  return (
    <div className={`share-controls ${className}`}>
      {linkFirst ? (
        <>
          {linkRow}
          {messageField}
        </>
      ) : (
        <>
          {messageField}
          {linkRow}
        </>
      )}
    </div>
  )
}

const AftershockScreen = ({
  displayMessage,
  showControls,
  showSharePrompt,
  shareMessage,
  onShareMessageChange,
  copyStatus,
  handleCopyLink,
  displayUrl
}) => (
  <div className="aftershock-screen">
    <div className="aftershock-content">
      <div className="aftershock-inner">
        <h2 className="aftershock-title">Unlocked: Victim of the prank!</h2>
        <p className="aftershock-description">
          Chill! It was a harmless prank. Nothing was accessed or damaged.
        </p>
        <div className="aftershock-message">
          <span className="aftershock-message-label">Message from your friend</span>
          <q className="aftershock-message-quote">{displayMessage}</q>
        </div>
        <div className="aftershock-gif-wrapper">
          <img className="aftershock-gif" src={celebrationGif} alt="Prank celebration" />
        </div>
        {showSharePrompt && (
          <p className="share-cta-text">Copy this link and share it with a friend to prank them ↓</p>
        )}
        {showControls && (
          <SharingControls
            className="share-controls-card"
            labelId="aftershock-message"
            message={shareMessage}
            onMessageChange={onShareMessageChange}
            copyStatus={copyStatus}
            handleCopyLink={handleCopyLink}
            displayUrl={displayUrl}
            messageLabel="Message"
            linkFirst
          />
        )}
      </div>
    </div>
  </div>
)

function App() {
  const [secondsRemaining, setSecondsRemaining] = useState(6)
  const [logEntries, setLogEntries] = useState([])
  const [isExploding, setIsExploding] = useState(false)
  const [hasExploded, setHasExploded] = useState(false)
  const [showSharePrompt, setShowSharePrompt] = useState(false)
  const [noticeVisible, setNoticeVisible] = useState(false)
  const [noticeDisabled, setNoticeDisabled] = useState(false)
  const [copyStatus, setCopyStatus] = useState('Copy link')
  const [shareUrl, setShareUrl] = useState('')
  const [displayUrl, setDisplayUrl] = useState('')
  const [shareMessage, setShareMessage] = useState(DEFAULT_MESSAGE)
  const [displayMessage, setDisplayMessage] = useState(DEFAULT_MESSAGE)
  const [referralId] = useState(() => generateReferralId())
  const logIndexRef = useRef(0)
  const logContainerRef = useRef(null)
  const copyResetRef = useRef(null)
  const messageLoadedFromUrl = useRef(false)

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const rootEl = document.documentElement
      if (noticeDisabled) {
        rootEl.style.setProperty('--notice-shift-active', '0px')
        rootEl.style.setProperty('--aftershock-extra-offset', '0px')
        rootEl.classList.remove('main-link-view')
        messageLoadedFromUrl.current = true
      } else {
        rootEl.style.removeProperty('--notice-shift-active')
        rootEl.style.removeProperty('--aftershock-extra-offset')
        rootEl.classList.add('main-link-view')
        messageLoadedFromUrl.current = false
      }

      return () => {
        rootEl.classList.remove('main-link-view')
      }
    }
  }, [noticeDisabled])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { origin, pathname } = window.location
      const segments = pathname.split('/').filter(Boolean)
      let baseSegments = segments
      let referralDetected = false

      if (segments.length) {
        segments.forEach((segment, index) => {
          if (/^[a-z0-9]{8}$/i.test(segment) && !referralDetected) {
            referralDetected = true
            baseSegments = segments.slice(0, index)
            const encodedMessage = segments[index + 1]
            if (encodedMessage && !messageLoadedFromUrl.current) {
              const decoded = decodeMessage(encodedMessage)
              if (decoded) {
                setDisplayMessage(decoded)
                messageLoadedFromUrl.current = true
              }
            }
            setNoticeDisabled((prev) => prev || true)
          }
        })
      }

      const basePath = baseSegments.length ? `/${baseSegments.join('/')}` : '/'
      const separator = basePath.endsWith('/') ? '' : '/'
      const baseSharePath = `${origin}${basePath}${separator}${referralId}`
      const messageToShare = (shareMessage || DEFAULT_MESSAGE).trim()
      const encodedMessage = encodeMessage(messageToShare || DEFAULT_MESSAGE)
      const sharePath = encodedMessage ? `${baseSharePath}/${encodedMessage}` : baseSharePath

      setDisplayUrl(sharePath)
      setShareUrl(sharePath)
    }

    if (!noticeDisabled) {
      const timer = setTimeout(() => {
        setNoticeVisible(true)
      }, 200)

      return () => {
        clearTimeout(timer)
        if (copyResetRef.current) {
          clearTimeout(copyResetRef.current)
        }
      }
    }

    return () => {
      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current)
      }
    }
  }, [referralId, noticeDisabled, shareMessage])

  useEffect(() => {
    if (!noticeDisabled && !messageLoadedFromUrl.current) {
      setDisplayMessage(shareMessage)
    }
  }, [shareMessage, noticeDisabled])

  useEffect(() => {
    if (secondsRemaining <= 0 || hasExploded) {
      return
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [secondsRemaining, hasExploded])

  useEffect(() => {
    if (hasExploded) return

    const interval = setInterval(() => {
      setLogEntries((prev) => {
        const nextIndex = logIndexRef.current % DOWNLOAD_MESSAGES.length
        logIndexRef.current += 1
        const nextLog = DOWNLOAD_MESSAGES[nextIndex]
        const timestamp = new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 2
        })
        const updated = [...prev, `${timestamp}  ${nextLog}`]
        return updated.length > 15 ? updated.slice(updated.length - 15) : updated
      })
    }, 200)

    return () => clearInterval(interval)
  }, [hasExploded])

  useEffect(() => {
    if (!logContainerRef.current) return
    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
  }, [logEntries])

  useEffect(() => {
    if (secondsRemaining === 0 && !hasExploded) {
      setIsExploding(true)
      const timeout = setTimeout(() => {
        setHasExploded(true)
        setIsExploding(false)
      }, 1200)
      return () => clearTimeout(timeout)
    }
  }, [secondsRemaining, hasExploded])

  useEffect(() => {
    if (hasExploded && noticeDisabled) {
      const timer = setTimeout(() => setShowSharePrompt(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [hasExploded, noticeDisabled])

  useEffect(() => {
    if (hasExploded) {
      document.body.classList.add('whiteout')
    } else {
      document.body.classList.remove('whiteout')
    }

    return () => {
      document.body.classList.remove('whiteout')
    }
  }, [hasExploded])

  const paddedSeconds = String(secondsRemaining).padStart(2, '0')

  const handleCopyLink = async () => {
    const urlToCopy = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')

    if (!urlToCopy) {
      return
    }

    const setCopiedState = (message) => {
      setCopyStatus(message)
      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current)
      }
      copyResetRef.current = setTimeout(() => {
        setCopyStatus('Copy link')
      }, 2500)
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(urlToCopy)
      } else {
        throw new Error('Clipboard API unavailable')
      }
      setCopiedState('Copied!')
    } catch (error) {
      try {
        const textArea = document.createElement('textarea')
        textArea.value = urlToCopy
        textArea.setAttribute('readonly', '')
        textArea.style.position = 'absolute'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        setCopiedState('Copied!')
      } catch (fallbackError) {
        setCopiedState('Copy failed')
      }
    }
  }

  const noticeContent = !noticeDisabled ? (
    <div className={`notice ${noticeVisible ? 'notice-visible' : ''}`}>
      <div className="notice-content">
        <div className="notice-title">Attention Please</div>
        <p className="notice-text">
          This is a prank website. The screen below is exactly what your friend will see when you
          send them this link. Share it and have a little fun.
        </p>
        <div className="notice-actions">
          <SharingControls
            labelId="notice-message"
            message={shareMessage}
            onMessageChange={setShareMessage}
            copyStatus={copyStatus}
            handleCopyLink={handleCopyLink}
            displayUrl={displayUrl || shareUrl}
          />
        </div>
      </div>
    </div>
  ) : null

  if (hasExploded) {
    return (
      <>
        {noticeContent}
        <AftershockScreen
          displayMessage={displayMessage}
          showControls={noticeDisabled && showSharePrompt}
          showSharePrompt={noticeDisabled && showSharePrompt}
          shareMessage={shareMessage}
          onShareMessageChange={setShareMessage}
          copyStatus={copyStatus}
          handleCopyLink={handleCopyLink}
          displayUrl={displayUrl || shareUrl}
        />
      </>
    )
  }

  return (
    <>
      {noticeContent}
      <main className={`app ${noticeVisible ? 'app-offset' : ''}`}>
        <h1>Your device is hacked.</h1>
        <p>
          If you exit before {paddedSeconds} {secondsRemaining === 1 ? 'second' : 'seconds'},
          your device will remain hacked.
        </p>
        <span className="wait-label">Wait for:</span>
        <div className="timer">{paddedSeconds}</div>
        <span className="timer-label">seconds remaining</span>
        <div className="downloads">
          <div className="downloads-title">Progress Log</div>
          <div className="downloads-log" ref={logContainerRef}>
            {logEntries.map((entry, index) => (
              <div className="downloads-line" key={`${entry}-${index}`}>
                {entry}
              </div>
            ))}
          </div>
      </div>
      </main>
      {isExploding && <div className="whiteout-overlay"></div>}
    </>
  )
}

export default App
