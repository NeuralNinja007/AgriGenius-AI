import { LeafIcon } from '../../../components/common/Icons.jsx'

export default function TypingIndicator() {
  return (
    <div className="msg bot">
      <div className="avatar bot">
        <LeafIcon />
      </div>
      <div className="bubble">
        <div className="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  )
}
