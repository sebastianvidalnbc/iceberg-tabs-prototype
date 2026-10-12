import { Panel, PanelHeader } from "@/v4-eos/ui/panel";
import { ObjectHeader, PropertyRow, PropertyRows } from "@/v4-eos/ui/property";
import {
  TextField,
  TextAreaField,
  SwitchField,
} from "@/v4-eos/ui/form-controls";
import {
  formatEditDate,
  outlineLabel,
  passByType,
  CONTENT_PAGE_HISTORY,
  type ContentPageConfig,
  type OutlineGroupId,
  type PassConfig,
  type PassType,
} from "../contentPages";

function Field({
  id,
  label,
  value,
  onChange,
  required,
  stacked,
  help,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  stacked?: boolean;
  help?: string;
}) {
  const invalid = Boolean(required && !value.trim());
  return (
    <PropertyRow label={label} htmlFor={id} required={required} stacked={stacked} help={help}>
      {stacked ? (
        <TextAreaField
          id={id}
          value={value}
          invalid={invalid}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <TextField
          id={id}
          value={value}
          invalid={invalid}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </PropertyRow>
  );
}

function Toggle({
  id,
  label,
  checked,
  onChange,
  help,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  return (
    <PropertyRow label={label} htmlFor={id} help={help}>
      <SwitchField checked={checked} onCheckedChange={onChange} />
    </PropertyRow>
  );
}

export function ContentPageProperties({
  group,
  config,
  slug,
  territory,
  editedBy,
  onPatch,
  onPatchPass,
}: {
  group: OutlineGroupId;
  config: ContentPageConfig;
  slug: string;
  territory: string;
  editedBy: string;
  onPatch: (patch: Partial<ContentPageConfig>) => void;
  onPatchPass: (type: PassType, patch: Partial<PassConfig>) => void;
}) {
  const history = CONTENT_PAGE_HISTORY;
  const passType =
    group.startsWith("pass-") ? (group.slice(5) as PassType) : null;
  const pass = passType ? passByType(config, passType) : null;

  return (
    <Panel className="ui-ws__region ui-ws-props" aria-label="Properties">
      <PanelHeader eyebrow="Properties" title={outlineLabel(group)} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <ObjectHeader
          eyebrow={slug}
          name={outlineLabel(group)}
          bleed
        />
        <div className="mt-4">
          <PropertyRows>
            {group === "overview" && (
              <>
                <Toggle
                  id="cp-enabled"
                  label="Enabled"
                  checked={config.enabled}
                  onChange={(v) => onPatch({ enabled: v })}
                  help="When off, ATOM titles do not render this template."
                />
                <PropertyRow label="Territory">
                  <span className="text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)]">
                    {territory}
                  </span>
                </PropertyRow>
                <PropertyRow label="Last modified">
                  <span className="text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)]">
                    {formatEditDate(history.editDate)} · {editedBy}
                  </span>
                </PropertyRow>
              </>
            )}

            {group === "memberships" && (
              <PropertyRow label="Passes" stacked help="Select a pass in the outline to edit it.">
                <span className="text-[length:var(--type-label-lg-size)] leading-[length:var(--type-label-lg-lh)] text-[var(--color-text-secondary)]">
                  Select, Premium / Premium Plus, STARZ, and Free. Free is
                  feature-flagged in production.
                </span>
              </PropertyRow>
            )}

            {pass && passType && (
              <>
                <Toggle
                  id={`${passType}-enabled`}
                  label="Enabled"
                  checked={pass.enabled}
                  onChange={(v) => onPatchPass(passType, { enabled: v })}
                />
                <Field
                  id={`${passType}-title`}
                  label="Title"
                  value={pass.title}
                  onChange={(v) => onPatchPass(passType, { title: v })}
                />
                <Field
                  id={`${passType}-cta`}
                  label="CTA Label"
                  value={pass.ctaLabel}
                  onChange={(v) => onPatchPass(passType, { ctaLabel: v })}
                />
                <Field
                  id={`${passType}-upcoming`}
                  label="Upcoming Title CTA Label"
                  value={pass.upcomingCtaLabel}
                  onChange={(v) => onPatchPass(passType, { upcomingCtaLabel: v })}
                />
                <Field
                  id={`${passType}-cta-url`}
                  label="CTA URL"
                  value={pass.ctaUrl}
                  required
                  onChange={(v) => onPatchPass(passType, { ctaUrl: v })}
                  help="Required. Checkout or plan path for this pass."
                />
                <Field
                  id={`${passType}-crumb`}
                  label="Breadcrumb Label"
                  value={pass.breadcrumbLabel}
                  onChange={(v) => onPatchPass(passType, { breadcrumbLabel: v })}
                />
                <Field
                  id={`${passType}-crumb-url`}
                  label="Breadcrumb URL"
                  value={pass.breadcrumbUrl}
                  onChange={(v) => onPatchPass(passType, { breadcrumbUrl: v })}
                />
                <Field
                  id={`${passType}-terms`}
                  label="T&C Module"
                  value={pass.termsModule}
                  onChange={(v) => onPatchPass(passType, { termsModule: v })}
                />
                <Toggle
                  id={`${passType}-filter`}
                  label="Filter Recommended Rail"
                  checked={pass.filterRecommended}
                  onChange={(v) => onPatchPass(passType, { filterRecommended: v })}
                />
                <Toggle
                  id={`${passType}-faq`}
                  label="Enable Custom FAQ"
                  checked={pass.enableCustomFaq}
                  onChange={(v) => onPatchPass(passType, { enableCustomFaq: v })}
                />
                {pass.enableCustomFaq && (
                  <Field
                    id={`${passType}-faq-title`}
                    label="Custom FAQ Title"
                    value={pass.customFaqTitle}
                    onChange={(v) => onPatchPass(passType, { customFaqTitle: v })}
                  />
                )}
              </>
            )}

            {group === "widgets" && (
              <>
                <Field id="w-what" label="Territory Specific Widget" value={config.whatIsWidget} onChange={(v) => onPatch({ whatIsWidget: v })} />
                <Field id="w-1" label="Optional Widget 1" value={config.extraWidget1} onChange={(v) => onPatch({ extraWidget1: v })} />
                <Field id="w-2" label="Optional Widget 2" value={config.extraWidget2} onChange={(v) => onPatch({ extraWidget2: v })} />
                <Field id="w-3" label="Optional Widget 3" value={config.extraWidget3} onChange={(v) => onPatch({ extraWidget3: v })} />
              </>
            )}

            {group === "footer" && (
              <Field id="w-foot" label="Footer Navigation Widget" value={config.footerNavWidget} onChange={(v) => onPatch({ footerNavWidget: v })} />
            )}

            {group === "sticky" && (
              <Field id="w-sticky" label="Sticky Banner Widget" value={config.stickyBannerWidget} onChange={(v) => onPatch({ stickyBannerWidget: v })} />
            )}

            {group === "legal" && (
              <>
                <Field id="legal" label="Legal" value={config.legal} stacked onChange={(v) => onPatch({ legal: v })} />
                <Field id="skip-main" label="Skip to Main Content" value={config.skipLinkMain} onChange={(v) => onPatch({ skipLinkMain: v })} />
                <Field id="skip-foot" label="Skip to Footer" value={config.skipLinkFooter} onChange={(v) => onPatch({ skipLinkFooter: v })} />
              </>
            )}

            {group === "urls" && (
              <>
                <Field id="url-faq" label="FAQ Success Redirect URL" value={config.faqSuccessRedirect} onChange={(v) => onPatch({ faqSuccessRedirect: v })} />
                <Field id="url-dev" label="Devices URL" value={config.devicesHref} onChange={(v) => onPatch({ devicesHref: v })} />
                <Field id="url-all" label="All Monthly Plans URL" value={config.allMonthlyPlansHref} onChange={(v) => onPatch({ allMonthlyPlansHref: v })} />
                <Field id="url-free" label="Free Episodes URL" value={config.freeEpisodesHref} onChange={(v) => onPatch({ freeEpisodesHref: v })} />
                <Field id="url-prem" label="Premium Episodes URL" value={config.premiumEpisodesHref} onChange={(v) => onPatch({ premiumEpisodesHref: v })} />
                <Field id="url-mix" label="Mixed Episodes URL" value={config.mixedEpisodesHref} onChange={(v) => onPatch({ mixedEpisodesHref: v })} />
              </>
            )}

            {group === "episodes" && (
              <>
                <Field id="ep-free" label="Free Episodes Text" value={config.freeEpisodesText} onChange={(v) => onPatch({ freeEpisodesText: v })} />
                <Field id="ep-prem" label="Premium Episodes Text" value={config.premiumEpisodesText} onChange={(v) => onPatch({ premiumEpisodesText: v })} />
                <Field id="btn-all" label="All Plans Button Text" value={config.allPlansBtnText} onChange={(v) => onPatch({ allPlansBtnText: v })} />
                <Field id="btn-prem" label="Premium Button Text" value={config.premiumBtnText} onChange={(v) => onPatch({ premiumBtnText: v })} />
                <Field id="btn-mix" label="Mixed Button Text" value={config.mixedBtnText} onChange={(v) => onPatch({ mixedBtnText: v })} />
                <Field id="btn-free" label="Free Button Text" value={config.freeBtnText} onChange={(v) => onPatch({ freeBtnText: v })} />
                <Field id="email" label="Email Placeholder" value={config.emailPlaceholder} onChange={(v) => onPatch({ emailPlaceholder: v })} />
              </>
            )}

            {group === "carousels" && (
              <>
                <Field id="car-tv" label="TV" value={config.carouselTv} onChange={(v) => onPatch({ carouselTv: v })} />
                <Field id="car-mov" label="Movies" value={config.carouselMovies} onChange={(v) => onPatch({ carouselMovies: v })} />
                <Field id="car-kids" label="Kids" value={config.carouselKids} onChange={(v) => onPatch({ carouselKids: v })} />
                <Field id="car-news" label="News" value={config.carouselNews} onChange={(v) => onPatch({ carouselNews: v })} />
              </>
            )}

            {group === "video-end" && (
              <>
                <Field id="ve1" label="Line 1" value={config.videoEnd1} onChange={(v) => onPatch({ videoEnd1: v })} />
                <Field id="ve2" label="Line 2" value={config.videoEnd2} onChange={(v) => onPatch({ videoEnd2: v })} />
              </>
            )}

            {group === "video-pause" && (
              <>
                <Field id="vp1" label="Line 1" value={config.videoPause1} onChange={(v) => onPatch({ videoPause1: v })} />
                <Field id="vp2" label="Line 2" value={config.videoPause2} onChange={(v) => onPatch({ videoPause2: v })} />
                <Field id="vpcta" label="CTA Label" value={config.videoPauseCta} onChange={(v) => onPatch({ videoPauseCta: v })} />
                <Field id="vph" label="CTA URL" value={config.videoPauseHref} onChange={(v) => onPatch({ videoPauseHref: v })} />
              </>
            )}

            {group === "i18n" && (
              <>
                <Field id="i-watch" label="Watch" value={config.i18n.watch} onChange={(v) => onPatch({ i18n: { ...config.i18n, watch: v } })} />
                <Field id="i-det" label="Details" value={config.i18n.details} onChange={(v) => onPatch({ i18n: { ...config.i18n, details: v } })} />
                <Field id="i-ser" label="About this Series" value={config.i18n.aboutSeries} onChange={(v) => onPatch({ i18n: { ...config.i18n, aboutSeries: v } })} />
                <Field id="i-mov" label="About this Movie" value={config.i18n.aboutMovie} onChange={(v) => onPatch({ i18n: { ...config.i18n, aboutMovie: v } })} />
                <Field id="i-faq" label="FAQ Title" value={config.i18n.faqTitle} onChange={(v) => onPatch({ i18n: { ...config.i18n, faqTitle: v } })} />
                <Field
                  id="i-sub-s"
                  label="Show Subheading"
                  value={config.i18n.showSubheading}
                  onChange={(v) => onPatch({ i18n: { ...config.i18n, showSubheading: v } })}
                  help="Use {{title}} for the ATOM name."
                />
                <Field
                  id="i-sub-m"
                  label="Movie Subheading"
                  value={config.i18n.movieSubheading}
                  onChange={(v) => onPatch({ i18n: { ...config.i18n, movieSubheading: v } })}
                  help="Use {{title}} for the ATOM name."
                />
              </>
            )}

            {group === "experiment" && (
              <Toggle
                id="opt"
                label="Optimizely"
                checked={config.optimizely}
                onChange={(v) => onPatch({ optimizely: v })}
                help="Modeller-only in production. A test left on for 28+ days slows the page."
              />
            )}
          </PropertyRows>
        </div>
      </div>
    </Panel>
  );
}
