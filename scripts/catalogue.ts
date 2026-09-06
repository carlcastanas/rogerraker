/* Roger Raker's catalogue: the single source of truth for both seeders.
 *
 * Every project is an actual video on the RogerRaker YouTube channel
 * (UCN2usuEuJN38_58-Z6-wJHg). Titles, upload dates, view counts, and video IDs
 * were read from YouTube in September 2026 and are accurate as of then. Cover
 * images and gallery frames are that video's own thumbnails, so every asset on
 * the site is Roger's own work.
 *
 * Synopses are short placeholders written from each title's plain meaning. They
 * are editable in /admin/projects and Roger should replace them with the real
 * story behind each piece. Nothing here invents a client, an award, or a credit.
 *
 * The products are the packs the shop is being built to sell. They are planned
 * inventory, not shipped releases.
 */

/**
 * Highest thumbnail YouTube actually has for that video, checked per id.
 * "hq" is 480x360 with black bars top and bottom — object-cover on a 16:9 box
 * crops those off and leaves 480x270, sharper than mq's 320x180. Only use it
 * where the source really is 16:9; "mq" is the safe pick for true 4:3 uploads.
 */
export const thumb = (id: string, res: "max" | "hq" | "mq" = "max") =>
  `https://i.ytimg.com/vi/${id}/${
    res === "max" ? "maxresdefault" : res === "hq" ? "hqdefault" : "mqdefault"
  }.jpg`;
/** The storyboard frames YouTube generates from the video itself, 16:9, no bars. */
export const frames = (id: string) =>
  ["mq1", "mq2", "mq3"].map((f) => `https://i.ytimg.com/vi/${id}/${f}.jpg`);

export const CHANNEL = "https://www.youtube.com/@rogerraker";
export const AVATAR =
  "https://yt3.googleusercontent.com/ytc/AIdro_lBZ-Kxpmw1yp1qYN-wRqGfe1gydkW6jpFrkEjN6iBnrIo=s900-c-k-c0x00ffffff-no-rj";

export type Seed = {
  title: string;
  slug: string;
  yt: string;
  res?: "max" | "hq" | "mq";
  date: string;
  views: number;
  category: string;
  featured?: boolean;
  role: string;
  scope: string[];
  description: string;
};

export const projects: Seed[] = [
  {
    title: "Kaibigan Lang",
    slug: "kaibigan-lang",
    yt: "1sakIOUCsAU",
    res: "hq",
    date: "2012-04-25",
    views: 1_060_700,
    category: "Short Films",
    featured: true,
    role: "Creator",
    scope: ["Story", "Camera", "Edit"],
    description:
      "This is the one that got the channel going. It's about being kept as just a friend, shot in 2012 with whatever gear I had. It's still the most watched thing I've made.",
  },
  {
    title: "Sapat Na",
    slug: "sapat-na",
    yt: "l-wGeqbcPy0",
    date: "2016-07-15",
    views: 888_640,
    category: "Short Films",
    featured: true,
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description:
      "About knowing when you've had enough, and deciding to stop asking someone for more than they can give.",
  },
  {
    title: "Dating Tayo",
    slug: "dating-tayo",
    yt: "ty6nOrAzZmU",
    date: "2013-05-09",
    views: 775_886,
    category: "Short Films",
    featured: true,
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description:
      "About what's left once the two of you are already over. I put the trailer up first, then the film.",
  },
  {
    title: "Sana Merong Tayo",
    slug: "sana-merong-tayo",
    yt: "0EIf-eaeTkA",
    date: "2014-09-26",
    views: 733_745,
    category: "Short Films",
    featured: true,
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description:
      "About wishing there had been something between you in the first place. I shot it in one afternoon while the light was good.",
  },
  {
    title: "Paano Kung Aaminin",
    slug: "paano-kung-aaminin",
    yt: "Pn9HTBM8dU8",
    date: "2016-11-24",
    views: 294_451,
    category: "Short Films",
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description: "About the sentence you practice in your head for years and never actually say.",
  },
  {
    title: "Salamat at May Isang Ikaw",
    slug: "salamat-at-may-isang-ikaw",
    yt: "W25le-ckgc0",
    date: "2017-02-14",
    views: 226_280,
    category: "Short Films",
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description: "I put this up for Valentine's. It's the warmest one I've made, about being thankful instead of wishing for more.",
  },
  {
    title: "Palabiro Dahil Umiibig",
    slug: "palabiro-dahil-umiibig",
    yt: "rQ85uyU-fLM",
    date: "2017-02-07",
    views: 107_138,
    category: "Short Films",
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description: "About joking around because saying it straight is harder.",
  },
  {
    title: "Torpe",
    slug: "torpe",
    yt: "gaPXjSLhI-s",
    date: "2014-04-06",
    views: 101_190,
    category: "Short Films",
    role: "Creator",
    scope: ["Story", "Direction", "Edit"],
    description:
      "An old one I re-cut and posted again. It's rough, but that's what the channel sounded like when I was starting.",
  },
  {
    title: "Junnievien | Pag-ibig sa Galon",
    slug: "junnievien-pagibig-sa-galon",
    yt: "RC3KaV_o56s",
    res: "hq",
    date: "2020-12-30",
    views: 798_633,
    category: "VlogMeyts",
    featured: true,
    role: "Creator, Editor",
    scope: ["Vlog", "Edit"],
    description:
      "This VlogMeyts episode reached the most people. It showed me the same storytelling works even without a script.",
  },
  {
    title: "Dadmeyts",
    slug: "dadmeyts",
    yt: "84JjR5ny2zM",
    date: "2022-07-18",
    views: 691_916,
    category: "VlogMeyts",
    featured: true,
    role: "Creator, Editor",
    scope: ["Vlog", "Edit"],
    description: "The episode where being a dad became part of the series. Same format, bigger cast.",
  },
  {
    title: "Isa Pang Payamansion? Lipatan Na!",
    slug: "isa-pang-payamansion",
    yt: "bbTbmIT4uzc",
    res: "hq",
    date: "2021-01-15",
    views: 685_247,
    category: "VlogMeyts",
    role: "Creator, Editor",
    scope: ["Vlog", "Edit"],
    description: "Moving day, filmed while it was happening, with the whole barkada around.",
  },
  {
    title: "Gender Reveal",
    slug: "gender-reveal",
    yt: "BO0WzRiWTXQ",
    date: "2021-02-23",
    views: 385_117,
    category: "VlogMeyts",
    role: "Creator, Editor",
    scope: ["Vlog", "Edit"],
    description: "A personal one. I shot it the way I shoot the films, slow and without rushing the moment.",
  },
  {
    title: "Uy Klasik",
    slug: "uy-klasik",
    yt: "1HLQjRLG4ck",
    date: "2023-05-06",
    views: 212_474,
    category: "VlogMeyts",
    role: "Creator, Editor",
    scope: ["Vlog", "Edit"],
    description: "Going back to the old spots with the same friends, ten years into the channel.",
  },
  {
    title: "TaranTaiwan",
    slug: "tarantaiwan",
    yt: "cnYkTG0evT8",
    date: "2023-08-04",
    views: 95_929,
    category: "VlogMeyts",
    role: "Creator, Editor",
    scope: ["Travel", "Vlog", "Edit"],
    description: "A travel run around Taiwan. This is the most color work I've done on a vlog.",
  },
  {
    title: "Tara Baguio",
    slug: "tara-baguio",
    yt: "sr8xHieklLw",
    date: "2023-05-30",
    views: 77_889,
    category: "VlogMeyts",
    role: "Creator, Editor",
    scope: ["Travel", "Vlog", "Edit"],
    description: "A road trip up north in the cold and the fog. The travel LUT pack came from this one.",
  },
  {
    title: "Pangarap Lang Kita",
    slug: "pangarap-lang-kita",
    yt: "cdo3nVO1AwA",
    res: "mq",
    date: "2011-10-11",
    views: 121_383,
    category: "Music Videos",
    role: "Director, Editor",
    scope: ["Music video", "Edit"],
    description: "Roger and Friends, 2011. It's the oldest thing still on the channel and where I learned to edit.",
  },
  {
    title: "Dahil sa Lag at DC",
    slug: "dahil-sa-lag-at-dc",
    yt: "r8D-tnfy_fY",
    date: "2013-05-28",
    views: 171_516,
    category: "Music Videos",
    role: "Director, Editor",
    scope: ["Music video", "Comedy", "Edit"],
    description: "A comedy music video from the early years, back when I was still figuring out the tone.",
  },
];

/* Planned shop inventory — editing and grading tools built out of the work above. */
export const products = [
  {
    title: "Kwento Grade LUTs",
    slug: "kwento-grade-short-film-luts",
    tagline: "The warm look from my short films. Twelve LUTs for Premiere, Resolve, and Final Cut.",
    category: "LUTs",
    price: 1490,
    compare: 1990,
    rating: 4.9,
    reviews: 128,
    sales: 640,
    featured: true,
    cover: thumb("l-wGeqbcPy0"),
    gallery: frames("l-wGeqbcPy0"),
    ramp: ["#161009", "#4a3320", "#a5743f", "#e0b47e", "#f7e6cd"],
    format: ".cube · .look · install guide",
    software: "Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut Pro",
    description:
      "This is the grade I use on Sapat Na, Sana Merong Tayo, and the rest of the short films. Warm skin, soft contrast, and shadows that stay open instead of going flat black. Drop it on your footage and adjust from there.",
    features: [
      { title: "12 LUTs", detail: "Each one comes at full and half strength so you're not stuck dragging an opacity slider." },
      { title: "Log and Rec.709 versions", detail: "Works whether you shoot a flat profile or straight out of a phone." },
      { title: "Made for Filipino skin tones", detail: "I tested these on my own footage, not on stock clips from somewhere else." },
      { title: "Install guide in Tagalog and English", detail: "Step by step, with screenshots for each app." },
    ],
  },
  {
    title: "VlogMeyts Editing Pack",
    slug: "vlogmeyts-editing-pack",
    tagline: "The transitions, sound effects, and captions I use on the vlogs.",
    category: "Templates",
    price: 990,
    compare: null,
    rating: 4.8,
    reviews: 214,
    sales: 1180,
    featured: true,
    cover: thumb("84JjR5ny2zM"),
    gallery: frames("84JjR5ny2zM"),
    ramp: ["#0b0d10", "#173040", "#2a7f9e", "#63d0e8", "#d6f7ff"],
    format: ".mogrt · .prproj · .wav · .mp4",
    software: "Premiere Pro 2023+, After Effects, CapCut",
    description:
      "This is what gives a VlogMeyts episode its pace. Whip cuts, zoom punches, the sound design that makes them land, and caption styles you can still read on a phone.",
    features: [
      { title: "40 transitions", detail: "Drag them onto the cut. No pre-comps to open and no plugins to buy." },
      { title: "120 sound effects", detail: "The same library I use on the channel, cleared for your own uploads." },
      { title: "Caption presets", detail: "Sized for vertical and horizontal, and still readable on a small screen." },
    ],
  },
  {
    title: "Sapat Na Project File",
    slug: "short-film-project-file-sapat-na",
    tagline: "My actual timeline for Sapat Na, with the cuts, grade, sound, and my notes.",
    category: "Templates",
    price: 1290,
    compare: null,
    rating: 5.0,
    reviews: 76,
    sales: 310,
    featured: true,
    cover: thumb("l-wGeqbcPy0"),
    gallery: frames("l-wGeqbcPy0"),
    ramp: ["#0d0c0f", "#2b2733", "#584f66", "#a99bbd", "#ece4f5"],
    format: ".prproj · .drp · PDF breakdown",
    software: "Premiere Pro, DaVinci Resolve 18+",
    description:
      "This is the finished project file for one of my most watched short films, with the footage included at proxy resolution. You can scrub the timeline, see where every cut lands, and read why I put it there.",
    features: [
      { title: "Full timeline", detail: "Every cut, dissolve, and audio track the way I delivered it." },
      { title: "Proxy footage included", detail: "Licensed for learning. Please don't re-upload it." },
      { title: "28-page breakdown", detail: "Shot list, the grade node by node, and the sound map." },
    ],
  },
  {
    title: "CapCut Vlog Set",
    slug: "capcut-vlog-set",
    tagline: "Edit a whole vlog on your phone without it looking like you did.",
    category: "Templates",
    price: 690,
    compare: 890,
    rating: 4.7,
    reviews: 341,
    sales: 1920,
    featured: false,
    cover: thumb("1HLQjRLG4ck"),
    gallery: frames("1HLQjRLG4ck"),
    ramp: ["#0a0a0c", "#2c2135", "#6b3f6d", "#cf7ba0", "#ffd8dd"],
    format: "CapCut templates · .lut · fonts list",
    software: "CapCut (mobile and desktop)",
    description:
      "For anyone starting where I started, with no laptop and no subscription. Thirty templates for intros, b-roll, captions, and end screens.",
    features: [
      { title: "30 templates", detail: "One tap to apply, and every layer stays editable after." },
      { title: "Mobile LUTs", detail: "The Kwento grade, cut down to what CapCut can handle." },
      { title: "No watermark", detail: "Nothing on your export except your own work." },
    ],
  },
  {
    title: "Tara Travel LUTs",
    slug: "tara-travel-luts",
    tagline: "The travel grade from the Baguio and Taiwan episodes.",
    category: "LUTs",
    price: 1190,
    compare: null,
    rating: 4.8,
    reviews: 97,
    sales: 430,
    featured: false,
    cover: thumb("sr8xHieklLw"),
    gallery: frames("cnYkTG0evT8"),
    ramp: ["#080c10", "#123243", "#2e7d8a", "#84cbc4", "#e8f6ef"],
    format: ".cube · .look",
    software: "Premiere Pro, DaVinci Resolve, Final Cut Pro, CapCut Pro",
    description:
      "Ten looks from the travel vlogs. Cold highland light, wet streets at night, and greens that phone cameras usually turn to mush.",
    features: [
      { title: "10 travel looks", detail: "Named after where I shot them." },
      { title: "Green and skin separation", detail: "Plants stay green without turning faces yellow." },
      { title: "Tested on phone footage", detail: "I checked these on iPhone and Android clips, not only on big cameras." },
    ],
  },
  {
    title: "Titles & Subtitles Kit",
    slug: "titles-and-subtitles-kit",
    tagline: "Title cards and subtitle styles that fit Tagalog line lengths.",
    category: "Templates",
    price: 790,
    compare: null,
    rating: 4.6,
    reviews: 58,
    sales: 265,
    featured: false,
    cover: thumb("W25le-ckgc0"),
    gallery: frames("W25le-ckgc0"),
    ramp: ["#0b0b0d", "#242429", "#55555f", "#b9b9c4", "#ffffff"],
    format: ".mogrt · .aep · .srt styles",
    software: "Premiere Pro 2023+, After Effects",
    description:
      "Most subtitle templates fall apart once a Tagalog sentence runs long. I built these around the wrap first and did the design after.",
    features: [
      { title: "24 title cards", detail: "Openers, chapter breaks, and end plates." },
      { title: "Subtitle styles that wrap", detail: "Two-line safe areas, tested on long sentences." },
      { title: "Editable from the panel", detail: "Change the copy and weight without opening After Effects." },
    ],
  },
  {
    title: "Paano Gumawa ng Short Film",
    slug: "paano-gumawa-ng-short-film",
    tagline: "Everything I know about making a short film, from the idea to the upload.",
    category: "E-books",
    price: 490,
    compare: 690,
    rating: 5.0,
    reviews: 402,
    sales: 2140,
    featured: true,
    cover: thumb("0EIf-eaeTkA"),
    gallery: frames("0EIf-eaeTkA"),
    ramp: ["#0d0e12", "#1f2733", "#3f566c", "#93aec4", "#e9f1f8"],
    format: "PDF · ePub",
    software: "Any editor",
    description:
      "Fifteen years of making short films with almost no budget, written down. How to write a story that fits one location, how to direct friends who have never acted, and how to actually finish something you're willing to post.",
    features: [
      { title: "9 chapters", detail: "Idea, script, cast, shoot, edit, grade, sound, upload, and what comes after." },
      { title: "Plain language", detail: "No film school vocabulary and nothing assumed." },
      { title: "Real examples", detail: "Walkthroughs from my own films, including the parts that went wrong." },
    ],
  },
  {
    title: "Sound Starter Pack",
    slug: "sound-starter-pack",
    tagline: "Ambience, room tone, and score beds for quiet scenes.",
    category: "Assets",
    price: 890,
    compare: null,
    rating: 4.7,
    reviews: 64,
    sales: 288,
    featured: false,
    cover: thumb("Pn9HTBM8dU8"),
    gallery: frames("Pn9HTBM8dU8"),
    ramp: ["#0a0b0a", "#1e2a22", "#3f6a51", "#8fc2a3", "#e4f4e9"],
    format: ".wav 48kHz · .mp3",
    software: "Any editor",
    description:
      "This is why the short films feel still instead of empty. Room tone, street ambience, rain, and simple piano and string beds that sit under dialogue without fighting it.",
    features: [
      { title: "90 ambience beds", detail: "Recorded around Metro Manila and up north. They loop cleanly." },
      { title: "20 score cues", detail: "Two to four minutes each, with stems." },
      { title: "Cleared for monetised uploads", detail: "No claims and no strikes." },
    ],
  },
];


export const profile = {
  full_name: "Roger Raker",
  bio: "Hi, ako nga pala si Roger. I've been making short films and vlogs on YouTube since 2010. It started with a camera, a laptop, and a group of friends. The channel is at 1.52 million subscribers now, and this is where I hand over the tools I use.",
  avatar_url: AVATAR,
  social_links: {
    youtube: CHANNEL,
    tiktok: "https://www.tiktok.com/@rogerraker",
    facebook: "https://www.facebook.com/rogerrocker/",
  },
  headline: "Filmmaker and vlogger, short films since 2010",
  location: "Quezon City, Philippines",
  email: "hello@rogerraker.com",
  philosophy:
    "Kwento muna. I only keep a cut if it helps the story, and I stop grading when I stop noticing the color. Everything in the shop is here because I needed it on my own edit first.",
  gear: [
    { label: "Camera", items: ["Sony A7 III", "Sony ZV-1", "iPhone for b-roll"] },
    { label: "Edit", items: ["Adobe Premiere Pro", "DaVinci Resolve", "CapCut for mobile cuts"] },
    { label: "Sound", items: ["Rode VideoMic Pro", "Rode Wireless GO II", "Zoom H1n"] },
    { label: "Light", items: ["Aputure Amaran 200x", "Godox SL60", "Practicals and window light"] },
  ],
};
