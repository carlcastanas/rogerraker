import type { SiteContent } from "./types";

/**
 * Shipped defaults. Written the way Roger would type it: first person, short
 * sentences, contractions, no em dashes, no slogans. Only claims that hold up
 * (1.52M subscribers, channel started November 2010, view counts read from
 * YouTube in September 2026). All of it is editable in /admin/content.
 */
export const defaultSiteContent: SiteContent = {
  hero: {
    eyebrow: "Short films and vlogs since 2010",
    headline: "Kwento Muna.",
    subhead:
      "Hi, ako nga pala si Roger. I've been making short films on YouTube since 2010, and the channel is at 1.52 million subscribers now. You can watch the work here, and get the same editing and color tools I use on it.",
    primary_cta: "Browse the toolkit",
    secondary_cta: "Watch the films",
    // A frame from Sana Merong Tayo. It's the cleanest full-colour still in the
    // catalogue, with no burned-in title art. The left half is rendered flat,
    // the way footage looks before a grade; the right half is the finished frame.
    before_image: "https://i.ytimg.com/vi/0EIf-eaeTkA/maxresdefault.jpg",
    after_image: "https://i.ytimg.com/vi/0EIf-eaeTkA/maxresdefault.jpg",
    frame_note: "Sana Merong Tayo, 2014. Drag to see what the grade does.",
  },
  work: {
    title: "The films",
    intro:
      "Short films, vlogs, and music videos from the channel. I write, shoot, and cut all of them myself.",
  },
  store: {
    title: "The toolkit",
    intro:
      "The LUTs, project files, and templates I use on my own edits. I put them together because people kept asking how I do it.",
    note: "You get the download right after checkout and it stays yours. Updates to your pack are free.",
  },
  about: {
    title: "About Roger",
    intro:
      "I started uploading in November 2010 with a borrowed camera and friends who had never acted before. The channel is at 1.52 million subscribers now, and I still make the films the same way.",
    philosophy_title: "I start with the story",
    process: [
      {
        title: "Write it down in one line",
        body: "Every film I've made started as a single sentence, like being stuck in the friend zone. If I can't say it in one line, I'm not ready to shoot it yet.",
      },
      {
        title: "Shoot with what you have",
        body: "One location, natural light, and friends as the cast. That's how all of these were made. You don't need more than that to start.",
      },
      {
        title: "Keep the quiet parts",
        body: "The best moments in these films are the few seconds after someone stops talking. I used to cut those out when I was starting. Now I leave them in.",
      },
      {
        title: "Grade until you stop noticing",
        body: "I go for warm skin and shadows that stay open. If people comment about the color, I pushed it too far.",
      },
      {
        title: "Post it before it's perfect",
        body: "I have fifteen years of uploads because I stopped waiting. The next one is always better than the one you keep polishing.",
      },
    ],
    metrics: [
      { value: "1.52M", label: "Subscribers on YouTube" },
      { value: "15 yrs", label: "Uploading since Nov 2010" },
      { value: "7.4M+", label: "Views on the work shown here" },
      { value: "17", label: "Films and vlogs in the archive" },
    ],
  },
  contact: {
    title: "Work with me",
    intro:
      "Brand films, editing and grading jobs, workshops, or a custom template build for your team. Tell me what you're making and when you need it.",
    email: "hello@rogerraker.com",
    response_time: "I read everything and reply within two business days.",
    project_types: [
      "Brand collab",
      "Short film or music video",
      "Editing or grading",
      "Custom template build",
      "Workshop or talk",
      "Something else",
    ],
    budgets: [
      "Under ₱25,000",
      "₱25,000 to ₱50,000",
      "₱50,000 to ₱150,000",
      "₱150,000 and up",
      "Not sure yet",
    ],
  },
  footer: {
    tagline: "Made in Quezon City.",
    legal: "Films © Roger Raker. Toolkit packs are licensed for your own commercial work.",
  },
  store_categories: ["LUTs", "Templates", "E-books", "Assets"],
  work_categories: ["Short Films", "VlogMeyts", "Music Videos"],
};
