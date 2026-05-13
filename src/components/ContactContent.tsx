"use client";

import { Mail, Phone, MapPin, MessageCircle, Clock } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { pickField, type PageContentMap } from "@/lib/page-content-schema";

type Props = {
  pageContent?: PageContentMap;
};

export function ContactContent({ pageContent }: Props) {
  const { t, locale } = useI18n();
  const get = (key: string, fallback: string) =>
    pickField(pageContent, key, locale, fallback);

  return (
    <div className="container-page py-12 sm:py-16">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {get("title", t.contact.title)}
          </h1>
          <p className="mt-3 max-w-prose text-sm text-ink-muted sm:text-base">
            {get("subtitle", t.contact.subtitle)}
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ContactCard
              icon={<MessageCircle className="h-5 w-5" />}
              label={get("whatsapp", t.contact.whatsapp)}
              value="+212 6 00 00 00 00"
              href="https://wa.me/212600000000"
              cta={get("whatsappCta", t.contact.whatsappCta)}
            />
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              label={get("email", t.contact.email)}
              value="hello@nextwin.stays"
              href="mailto:hello@nextwin.stays"
              cta={get("emailCta", t.contact.emailCta)}
            />
            <ContactCard
              icon={<Phone className="h-5 w-5" />}
              label={get("phone", t.contact.phone)}
              value="+212 5 24 00 00 00"
              href="tel:+212524000000"
              cta={get("phoneCta", t.contact.phoneCta)}
            />
            <ContactCard
              icon={<MapPin className="h-5 w-5" />}
              label={get("office", t.contact.office)}
              value={get("officeAddress", t.contact.officeAddress)}
              cta={get("officeCta", t.contact.officeCta)}
            />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-700">
            <Clock className="h-3.5 w-3.5" />
            {get("replyTime", t.contact.replyTime)}
          </div>
        </div>

        <form className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
          <h2 className="font-display text-xl font-semibold text-ink">
            {get("formTitle", t.contact.formTitle)}
          </h2>
          <p className="mt-1 text-sm text-ink-muted">
            {get("formSubtitle", t.contact.formSubtitle)}
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={get("firstName", t.contact.firstName)}>
              <input className="field-base" />
            </Field>
            <Field label={get("lastName", t.contact.lastName)}>
              <input className="field-base" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={get("emailLabel", t.contact.emailLabel)}>
              <input type="email" className="field-base" placeholder="you@example.com" />
            </Field>
          </div>
          <div className="mt-4">
            <Field label={get("topic", t.contact.topic)}>
              <select className="field-base">
                <option>{get("topicEnquiry", t.contact.topicEnquiry)}</option>
                <option>{get("topicSpecial", t.contact.topicSpecial)}</option>
                <option>{get("topicElse", t.contact.topicElse)}</option>
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label={get("messageLabel", t.contact.messageLabel)}>
              <textarea
                rows={5}
                className="field-base resize-none"
                placeholder={get("messagePlaceholder", t.contact.messagePlaceholder)}
              />
            </Field>
          </div>
          <button type="button" className="btn-primary mt-5 w-full">
            {get("sendBtn", t.contact.sendBtn)}
          </button>
          <p className="mt-3 text-center text-[11px] text-ink-soft">
            {get("privacyNote", t.contact.privacyNote)}
          </p>

          <style>{`
            .field-base {
              width: 100%;
              border-radius: 0.625rem;
              border: 1px solid rgb(229 231 235);
              background: white;
              padding: 0.625rem 0.875rem;
              font-size: 0.875rem;
              color: #1A2233;
              outline: none;
              transition: all 0.2s;
            }
            .field-base::placeholder { color: #7A8497; }
            .field-base:focus {
              border-color: #FF385C;
              box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.18);
            }
          `}</style>
        </form>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  label,
  value,
  href,
  cta,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  cta: string;
}) {
  const Inner = (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:border-brand-200 hover:shadow-card">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          {icon}
        </span>
        <span className="text-sm font-semibold text-ink">{label}</span>
      </div>
      <div className="mt-3 text-sm font-medium text-ink">{value}</div>
      <div className="mt-1 text-[12px] font-semibold text-brand-700">{cta} →</div>
    </div>
  );
  return href ? <a href={href}>{Inner}</a> : Inner;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
