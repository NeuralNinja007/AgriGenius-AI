import { useEffect, useRef, useState } from 'react'
import { AttachIcon, CameraIcon, GalleryIcon, MicIcon, SendIcon } from '../../../components/common/Icons.jsx'
import { compressImage } from '../../../utils/imageCompress.js'
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../../../utils/speech.js'

export default function ChatInputBar({
  strings,
  language,
  isLoading,
  onSend,
  cameraTriggerRef,
  droppedFileEvent,
  draftPromptEvent,
  showWelcomeHelper,
}) {
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [diseaseMode, setDiseaseMode] = useState(false)
  const [attachMenuOpen, setAttachMenuOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState(null)

  const galleryInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (cameraTriggerRef) {
      cameraTriggerRef.current = () => {
        setDiseaseMode(true)
        cameraInputRef.current?.click()
      }
    }
  }, [cameraTriggerRef])

  useEffect(() => {
    if (droppedFileEvent?.file) {
      loadImageFile(droppedFileEvent.file)
    }
  }, [droppedFileEvent])

  useEffect(() => {
    if (draftPromptEvent?.prompt) {
      setInput(draftPromptEvent.prompt)
    }
  }, [draftPromptEvent])

  const loadImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    try {
      const dataUrl = await compressImage(file)
      setPendingImage({ dataUrl, name: file.name })
    } catch {
      const reader = new FileReader()
      reader.onload = () => setPendingImage({ dataUrl: reader.result, name: file.name })
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (event) => {
    loadImageFile(event.target.files?.[0])
    event.target.value = ''
    setAttachMenuOpen(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed && !pendingImage) return
    onSend(trimmed, pendingImage?.dataUrl || null, {
      intent: diseaseMode && pendingImage ? 'disease' : 'general',
      diseaseMode,
    })
    setInput('')
    setPendingImage(null)
    setDiseaseMode(false)
  }

  const toggleVoice = () => {
    if (!isSpeechRecognitionSupported()) {
      setVoiceError(strings.voiceUnsupported)
      return
    }
    setVoiceError(null)

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = createSpeechRecognition(
      language,
      (transcript) => {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      },
      () => setVoiceError(strings.voiceUnsupported),
      () => setIsListening(false)
    )
    if (!recognition) return
    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }

  return (
    <form className="input-bar" onSubmit={handleSubmit}>
      {pendingImage && (
        <div className="pending-image-row">
          <img src={pendingImage.dataUrl} alt="" className="pending-image-thumb" />
          <span className="pending-image-name">
            {diseaseMode ? strings.detectDisease : pendingImage.name}
          </span>
          <button
            type="button"
            className="pending-image-remove"
            onClick={() => {
              setPendingImage(null)
              setDiseaseMode(false)
            }}
            aria-label="Remove photo"
          >
            ✕
          </button>
        </div>
      )}

      {voiceError && <div className="voice-error">{voiceError}</div>}
      {showWelcomeHelper && <div className="input-helper">{strings.welcomeInputHelper}</div>}

      <div className="input-row">
        <div className="attach-wrapper">
          <button
            type="button"
            className="attach-btn"
            onClick={() => setAttachMenuOpen((value) => !value)}
            aria-label={strings.attachLabel}
          >
            <AttachIcon />
          </button>
          {attachMenuOpen && (
            <div className="attach-menu">
              <button
                type="button"
                onClick={() => {
                  setDiseaseMode(true)
                  cameraInputRef.current?.click()
                  setAttachMenuOpen(false)
                }}
              >
                <CameraIcon /> {strings.detectDisease}
              </button>
              <button
                type="button"
                onClick={() => {
                  cameraInputRef.current?.click()
                  setAttachMenuOpen(false)
                }}
              >
                <CameraIcon /> {strings.takePhoto}
              </button>
              <button
                type="button"
                onClick={() => {
                  galleryInputRef.current?.click()
                  setAttachMenuOpen(false)
                }}
              >
                <GalleryIcon /> {strings.chooseFromGallery}
              </button>
            </div>
          )}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            hidden
            onChange={handleFileInputChange}
          />
          <input ref={galleryInputRef} type="file" accept="image/*" hidden onChange={handleFileInputChange} />
        </div>

        <button
          type="button"
          className={`mic-btn ${isListening ? 'listening' : ''}`}
          onClick={toggleVoice}
          aria-label={strings.voiceLabel}
          title={isListening ? strings.voiceListening : strings.voiceLabel}
        >
          <MicIcon />
        </button>

        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={pendingImage ? strings.inputPlaceholderWithPhoto : strings.inputPlaceholder}
          autoComplete="off"
          disabled={isLoading}
        />
        <button
          className="send-btn"
          type="submit"
          disabled={isLoading || (!input.trim() && !pendingImage)}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <div className="input-hint">{strings.inputHint}</div>
    </form>
  )
}
