import { parseFormattedResponse } from '../../../utils/formatResponse.js'

export default function FormattedMessage({ content, dir = 'ltr' }) {
  const blocks = parseFormattedResponse(content)
  if (!blocks.length) return null

  return (
    <div className="formatted-content" dir={dir}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <div key={i} className="fmt-heading">
                {block.content}
              </div>
            )
          case 'label':
            return (
              <div key={i} className={`fmt-label-row ${block.highlight ? 'fmt-highlight' : ''}`}>
                <span className="fmt-label">{block.label}:</span>{' '}
                <span className="fmt-label-value">{block.content}</span>
              </div>
            )
          case 'bullet':
            return (
              <div key={i} className="fmt-bullet">
                <span className="fmt-bullet-dot" aria-hidden="true">
                  •
                </span>
                <span>{block.content}</span>
              </div>
            )
          case 'numbered':
            return (
              <div key={i} className="fmt-numbered">
                <span className="fmt-number">{block.number}.</span>
                <span>{block.content}</span>
              </div>
            )
          default:
            return (
              <p key={i} className="fmt-paragraph">
                {block.content}
              </p>
            )
        }
      })}
    </div>
  )
}
