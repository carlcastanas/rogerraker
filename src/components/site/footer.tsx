import Image from "next/image";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { getProfile, getSiteContent } from "@/lib/queries";
import { brandIcons } from "./brand-icons";

/**
 * lucide-react v1 dropped brand glyphs; the real marks are inline in
 * brand-icons. A platform is listed only when the profile actually has a link
 * for it — no dead icons.
 */
const SOCIALS = [
  { key: "youtube", label: "YouTube", Icon: brandIcons.youtube },
  { key: "tiktok", label: "TikTok", Icon: brandIcons.tiktok },
  { key: "facebook", label: "Facebook", Icon: brandIcons.facebook },
  { key: "instagram", label: "Instagram", Icon: brandIcons.instagram },
  { key: "x", label: "X", Icon: brandIcons.x },
  { key: "linkedin", label: "LinkedIn", Icon: brandIcons.linkedin },
  { key: "github", label: "GitHub", Icon: brandIcons.github },
] as const;

const NAV = [
  { href: "/work", label: "The films" },
  { href: "/store", label: "The toolkit" },
  { href: "/#about", label: "About Roger" },
  { href: "/#contact", label: "Work with me" },
];

export async function SiteFooter() {
  const [content, profile] = await Promise.all([getSiteContent(), getProfile()]);
  const links = profile?.social_links ?? {};
  const socials = SOCIALS.filter((s) => Boolean(links[s.key]));
  const email = content.contact.email;

  return (
    <footer className="border-t border-stroke bg-void">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            {/* Same stylized wordmark as SiteNav — larger lockup, one brand logo. */}
            <Link href="/" className="inline-flex" aria-label="Roger Raker, home">
              <Image
                src="/branding/logo-stylized-white.png"
                alt="Roger Raker"
                width={250}
                height={44}
                className="h-11 w-auto max-w-[min(100%,250px)]"
              />
            </Link>
            <p className="mt-4 max-w-[42ch] text-[14px] leading-[1.7] text-ink/75">
              {content.footer.tagline}
            </p>
            {email ? (
              <a
                href={`mailto:${email}`}
                className="mt-5 inline-flex items-center gap-2 text-[14px] leading-6 text-muted transition-colors hover:text-cyan"
              >
                <Mail size={15} strokeWidth={1.5} />
                {email}
              </a>
            ) : null}
          </div>

          <div className="lg:col-span-3">
            <h2 className="label">Around the site</h2>
            <ul className="mt-4 space-y-3">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[14px] leading-6 text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {socials.length ? (
            <div className="lg:col-span-4">
              <h2 className="label">Where else to find me</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {socials.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <a
                      href={links[key]}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-2 rounded-[2px] border border-stroke px-3 py-2 text-[13px] leading-5 text-muted transition-colors hover:border-cyan/50 hover:text-cyan"
                    >
                      <Icon size={15} />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="hairline mt-12 flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[70ch] text-[13px] leading-relaxed text-muted">
            {content.footer.legal}
          </p>
          <Link
            href="/admin"
            className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-faint transition-colors hover:text-muted"
          >
            <Lock size={13} strokeWidth={1.5} />
            Admin login
          </Link>
        </div>
      </div>
    </footer>
  );
}
