import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: Crumb[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="ui-breadcrumb" aria-label="Breadcrumb">
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {last ? (
                  <span className="ui-breadcrumb__item" aria-current="page">
                    {c.label}
                  </span>
                ) : (
                  <a
                    className="ui-breadcrumb__item"
                    href={c.href ?? "#"}
                    onClick={c.onClick}
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
