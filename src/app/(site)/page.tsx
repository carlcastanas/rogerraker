import { AboutSection } from "@/components/site/about-section";
import { ContactSection } from "@/components/site/contact-section";
import { CameraScroll } from "@/components/site/camera-scroll";
import { FilmsSection } from "@/components/site/films-section";
import { Hero } from "@/components/site/hero";
import { StoreSection } from "@/components/site/store-section";
import {
  getFeaturedProducts,
  getProfile,
  getProjects,
  getSiteContent,
} from "@/lib/queries";
import type { Project } from "@/lib/types";

/**
 * Exactly six films, featured ones first so both the short films and the
 * VlogMeyts episodes are represented — and so the grid fills every row at
 * one, two, and three columns. The archive and its filters live on /work.
 */
function pickSix(projects: Project[]) {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, 6);
}

export default async function HomePage() {
  const [content, profile, projects, products] = await Promise.all([
    getSiteContent(),
    getProfile(),
    getProjects({ publishedOnly: true }),
    getFeaturedProducts(6),
  ]);

  return (
    <>
      <Hero content={content} profile={profile} />
      <CameraScroll />
      <FilmsSection
        content={content.work}
        projects={pickSix(projects)}
        total={projects.length}
      />
      <StoreSection content={content.store} products={products} />
      <AboutSection content={content.about} profile={profile} />
      <ContactSection content={content.contact} />
    </>
  );
}
