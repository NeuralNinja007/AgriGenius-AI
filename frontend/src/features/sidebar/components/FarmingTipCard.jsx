import { NavIcon } from '../../../components/common/Icons.jsx'

export default function FarmingTipCard({ strings }) {
  return (
    <section className="sidebar-card farming-tip-card" aria-labelledby="farming-tip-title">
      <div className="sidebar-card-title" id="farming-tip-title">
        <span className="line-icon" aria-hidden="true">
          <NavIcon id="tip" />
        </span>
        <span>{strings.farmingTipTitle}</span>
      </div>
      <p>{strings.farmingTipText}</p>
    </section>
  )
}
