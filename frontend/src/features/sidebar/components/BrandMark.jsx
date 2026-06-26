import agrigeniusLogo from '../../../assets/images/agrigenius-logo.png'

export default function BrandMark() {
  return (
    <span className="brand-mark-shell" aria-hidden="true">
      <img className="brand-mark" src={agrigeniusLogo} alt="" draggable="false" />
    </span>
  )
}
