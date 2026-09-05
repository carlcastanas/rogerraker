import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";

const ROUTES = [
  { href: "/work", title: "The films", detail: "Short films, VlogMeyts, music videos." },
  { href: "/store", title: "The toolkit", detail: "LUTs, templates, sound, and guides." },
  { href: "/", title: "Home", detail: "The short version of all of it." },
];

export default function NotFound() {
  return (
    <div className="shell pt-24 pb-20 md:pt-28 md:pb-28">
      <div className="mx-auto max-w-[680px]">
        <p className="label tnum">Error 404</p>
        <h1 className="display mt-3 text-[clamp(1.75rem,3.2vw,2.75rem)] text-ink">
          Wala rito.
        </h1>
        <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.75] text-ink/75 md:text-base">
          The link might have a typo in it, or I moved something around. Here&apos;s where the
          rest of it is.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-px border border-stroke bg-stroke sm:grid-cols-3 md:mt-10">
          {ROUTES.map((route) => (
            <li key={route.href} className="bg-panel">
              <Link
                href={route.href}
                className="block h-full px-5 py-5 transition-colors hover:bg-panel-2"
              >
                <span className="display-tight block text-[15px] text-ink">{route.title}</span>
                <span className="mt-1.5 block text-[13px] leading-[1.65] text-muted">
                  {route.detail}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <ButtonLink href="/work" variant="primary" size="lg" className="mt-10">
          Watch the films
        </ButtonLink>
      </div>
    </div>
  );
}
