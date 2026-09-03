import { OpsHubLogo } from "../ui-lib/OpsHubLogo";
import { MSym } from "../ui/msym";

// Global platform top bar (Eos "Opshub bar", Figma node 449:14209). This is the
// NBCU internal-tools platform chrome that wraps individual apps like Iceberg —
// it is intentionally separate from Iceberg's own product navigation (the
// floating rail below), so no product route/IA is affected. Faithful to the Eos
// component: brand lockup (left) and the utility cluster (environment selector,
// app menu, account) on the right.
//
// The Eos component's "Apps / Admin tools" tabs belong to OpsHub's top-level
// app-chooser context; once a user has entered a specific app (Iceberg), those
// tabs are not shown, so they are intentionally omitted here.
//
// Environment is fixed to INT-NFT (Eos default variant); the pill's accent
// derives from the Eos environment colour for that variant.
export function TopBar() {
  return (
    <header className="ui-topbar">
      <div className="ui-topbar__brand">
        <OpsHubLogo size={24} />
        <span className="ui-topbar__brand-name">OpsHub</span>
      </div>

      <div className="ui-topbar__utils">
        <button
          type="button"
          className="ui-topbar__env"
          aria-label="Environment: Peacock INT-NFT"
        >
          <OpsHubLogo size={18} className="ui-topbar__env-chip" />
          <span className="ui-topbar__env-label">Peacock: INT-NFT</span>
          <MSym name="keyboard_arrow_down" size={18} />
        </button>

        <button
          type="button"
          className="ui-topbar__icon-btn"
          aria-label="App menu"
        >
          <MSym name="apps" size={24} />
        </button>

        <button
          type="button"
          className="ui-topbar__icon-btn ui-topbar__account"
          aria-label="Account"
        >
          <MSym name="account_circle" size={30} filled />
        </button>
      </div>
    </header>
  );
}
