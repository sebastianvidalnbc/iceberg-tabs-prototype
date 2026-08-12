import { useState } from "react";
import { Tabs } from "../Tabs";
import { SegmentedControl } from "../SegmentedControl";
import { Breadcrumb } from "../Breadcrumb";
import { SidebarNavItem, DisclosureNavItem } from "../Nav";

export function NavigationSection() {
  const [tab, setTab] = useState("content");
  const [seg, setSeg] = useState("desktop");
  const [nav, setNav] = useState("pages");
  const [open, setOpen] = useState(true);

  return (
    <section id="navigation">
      <h2>Navigation</h2>
      <p className="ui-ds__lead">
        Tabs switch mutually-exclusive peer views; a segmented control picks one of a small fixed
        set inline; disclosure items expand content in place.
      </p>

      <h3>Tabs</h3>
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "content", label: "Section Content" },
          { id: "options", label: "Section Options" },
          { id: "preview", label: "Preview", icon: "star" },
        ]}
      >
        <p className="ui-ds__lead" style={{ margin: 0 }}>
          Panel for “{tab}”.
        </p>
      </Tabs>

      <h3>Segmented control</h3>
      <SegmentedControl
        aria-label="Preview device"
        value={seg}
        onChange={setSeg}
        options={[
          { label: "Desktop", value: "desktop" },
          { label: "Tablet", value: "tablet" },
          { label: "Mobile", value: "mobile" },
        ]}
      />

      <h3>Breadcrumb</h3>
      <Breadcrumb items={[{ label: "Home" }, { label: "Pages" }, { label: "Pricing" }]} />

      <h3>Sidebar nav</h3>
      <div className="ui-ds__card" style={{ maxWidth: 260 }}>
        <SidebarNavItem icon="star" label="Pages" active={nav === "pages"} onClick={() => setNav("pages")} />
        <SidebarNavItem icon="sparkles" label="Components" active={nav === "components"} onClick={() => setNav("components")} />
        <DisclosureNavItem label="Settings" expanded={open} onToggle={() => setOpen((v) => !v)}>
          <SidebarNavItem label="General" active={nav === "general"} onClick={() => setNav("general")} />
          <SidebarNavItem label="Advanced" active={nav === "advanced"} onClick={() => setNav("advanced")} />
        </DisclosureNavItem>
      </div>

      <h3 style={{ marginBottom: 4 }}>When to use what</h3>
      <ul className="ui-ds__lead">
        <li><strong>Tabs</strong> — switch between mutually-exclusive peer views.</li>
        <li><strong>Accordion / Disclosure</strong> — expand/collapse content in place.</li>
        <li><strong>Tree</strong> — hierarchical, nestable, reorderable rows.</li>
        <li><strong>Segmented control</strong> — pick one of a small fixed set inline.</li>
      </ul>
    </section>
  );
}
