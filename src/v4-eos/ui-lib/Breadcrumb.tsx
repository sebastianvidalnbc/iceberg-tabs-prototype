import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: Crumb[];
  /**
   * Ellipsis-truncate each crumb label to a few characters and expose the full
   * label on hover via `title`. Used in the compact widget editor bar so long
   * slugs/names (e.g. "qa-republish-Copy of default") don't wrap and crumble
   * the top bar on small screens.
   */
  truncate?: boolean;
}

export function Breadcrumb({ items, truncate }: BreadcrumbProps) {
  return (
    <nav
      className={truncate ? "ui-breadcrumb ui-breadcrumb--truncate" : "ui-breadcrumb"}
      aria-label="Breadcrumb"
    >
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {last ? (
                  <span
                    className="ui-breadcrumb__item"
                    aria-current="page"
                    title={truncate ? c.label : undefined}
                  >
                    {c.label}
                  </span>
                ) : (
                  <a
                    className="ui-breadcrumb__item"
                    href={c.href ?? "#"}
                    onClick={c.onClick}
                    title={truncate ? c.label : undefined}
                  >
                    {c.label}
                  </a>
                )}
              </li>
              {!last && (
                <li className="ui-breadcrumb__sep" aria-hidden="true">
                  /
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
