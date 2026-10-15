import type { Faq, LegalDoc, Maker, Store, WearerNote } from "../types";

export const wearerNotes: WearerNote[] = [
  { productSlug: "ferryman-overcoat", name: "Dalia", city: "Amman", worn: "3 winters", size: "S", height: "168 cm", fitVerdict: "true to size", text: "Fits over my thickest jumper. The back pleat is genius — I can cycle in it. People ask about it at least once a week." },
  { productSlug: "ferryman-overcoat", name: "Tomás", city: "Porto", worn: "2 winters", size: "L", height: "184 cm", fitVerdict: "runs large", text: "Generous cut, I could've taken M. Lost a button last year, they sewed it back for free within a week." },
  { productSlug: "harbour-chore-jacket", name: "Jun", city: "Osaka", worn: "1 year", size: "M", height: "175 cm", fitVerdict: "true to size", text: "It was stiff for a month. Now it's the softest thing I own. The pencil slot is very me." },
  { productSlug: "harbour-chore-jacket", name: "Leen", city: "Beirut", worn: "8 months", size: "S", height: "162 cm", fitVerdict: "true to size", text: "I wear it as a shirt in spring and a jacket in autumn. The roof tile colour is even better in daylight." },
  { productSlug: "morning-poplin-shirt", name: "Anna", city: "Berlin", worn: "4 years", size: "XS", height: "160 cm", fitVerdict: "true to size", text: "Still crisp after four years and maybe 200 washes. The stripe matching on the pocket is absurdly good." },
  { productSlug: "salt-linen-camp-shirt", name: "Karim", city: "Dubai", worn: "2 summers", size: "L", height: "180 cm", fitVerdict: "runs large", text: "Boxy in the best way. Only shirt I can wear in Dubai in July." },
  { productSlug: "lantern-merino-crew", name: "Sophie", city: "London", worn: "5 winters", size: "M", height: "170 cm", fitVerdict: "true to size", text: "I darned the elbow with the yarn card last year. Now it's my favourite part of the jumper." },
  { productSlug: "lantern-merino-crew", name: "Faris", city: "Amman", worn: "2 winters", size: "L", height: "182 cm", fitVerdict: "runs small", text: "Slim through the body — size up if you like room. Softest merino I've worn." },
  { productSlug: "fisherman-rib-sweater", name: "Ingrid", city: "Bergen", worn: "3 winters", size: "M", height: "174 cm", fitVerdict: "true to size", text: "Properly warm. Survived a winter of Norwegian ferry decks." },
  { productSlug: "long-table-trousers", name: "Yousef", city: "Riyadh", worn: "2 years", size: "32", height: "178 cm", fitVerdict: "true to size", text: "They hemmed them to my shoes in the Amman shop while I drank coffee. The side adjusters mean I never think about a belt." },
  { productSlug: "tide-pleat-trousers", name: "Mira", city: "Lisbon", worn: "1 summer", size: "28", height: "165 cm", fitVerdict: "true to size", text: "Look like proper trousers, feel like pyjamas. I own two now." },
  { productSlug: "indigo-selvedge-trousers", name: "Sam", city: "Melbourne", worn: "14 months", size: "30", height: "177 cm", fitVerdict: "runs small", text: "Waited six months to wash them. The fades on the knees are honestly beautiful." },
  { productSlug: "orchard-midi-dress", name: "Hala", city: "Amman", worn: "2 summers", size: "S", height: "164 cm", fitVerdict: "true to size", text: "It rustles when I walk and everyone asks where it's from. And the pockets hold a whole phone." },
  { productSlug: "roof-tile-slip-dress", name: "Clara", city: "Madrid", worn: "1 summer", size: "M", height: "171 cm", fitVerdict: "true to size", text: "The bias cut is so flattering. Wore it to three weddings." },
  { productSlug: "paper-lantern-skirt", name: "Noor", city: "Doha", worn: "2 years", size: "S", height: "158 cm", fitVerdict: "true to size", text: "The pleats really do open like a lantern. Wore it to my thesis defence." },
  { productSlug: "everyday-heavy-tee", name: "Ali", city: "Cairo", worn: "3 years", size: "M", height: "176 cm", fitVerdict: "true to size", text: "No twisting, no collar ripple, three years in. Bought four more." },
  { productSlug: "herringbone-field-coat", name: "Euan", city: "Edinburgh", worn: "2 winters", size: "L", height: "186 cm", fitVerdict: "true to size", text: "Real Scottish weather proof. The throat latch saved me on the Pentlands." },
  { productSlug: "market-tote", name: "Rasha", city: "Amman", worn: "1 year", size: "One size", height: "—", fitVerdict: "true to size", text: "Carried a watermelon in it. Twice." },
  { productSlug: "weather-scarf", name: "Pieter", city: "Antwerp", worn: "2 winters", size: "One size", height: "—", fitVerdict: "true to size", text: "Long enough to wrap twice. Soft from day one." },
  { productSlug: "indigo-work-jacket", name: "Mei", city: "Taipei", worn: "1 year", size: "S", height: "163 cm", fitVerdict: "runs large", text: "Boxy and big — I love it that way but size down if you want it neat." },
  { productSlug: "dockside-stripe-tee", name: "Luca", city: "Genoa", worn: "1 summer", size: "M", height: "179 cm", fitVerdict: "true to size", text: "Finally a breton that doesn't feel like a costume." },
];

export const stores: Store[] = [
  {
    id: "amman",
    city: "Amman",
    country: "Jordan",
    address: "14 Rainbow Street, Jabal Amman",
    hours: [
      { days: "Sat – Thu", time: "11:00 – 20:00" },
      { days: "Friday", time: "15:00 – 20:00" },
    ],
    phone: "+962 6 555 0142",
    email: "amman@ourlet.house",
    note: "Our studio and workroom. The pattern wall is upstairs — ask and we'll take you up.",
    services: ["Fittings", "Free hemming", "Mending counter", "Pattern wall tours"],
  },
  {
    id: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    address: "Rua da Rosa 211, Bairro Alto",
    hours: [
      { days: "Tue – Sat", time: "11:00 – 19:30" },
      { days: "Sunday", time: "12:00 – 17:00" },
    ],
    phone: "+351 21 555 0819",
    email: "lisboa@ourlet.house",
    note: "A former bookbinder's shop. The Salt & Linen chapter was drafted twenty minutes from here.",
    services: ["Fittings", "Free hemming", "Mending drop-off"],
  },
  {
    id: "kyoto",
    city: "Kyoto",
    country: "Japan",
    address: "Higashiyama, 2-chōme 7 (appointment only)",
    hours: [{ days: "Thu – Sun", time: "By appointment" }],
    phone: "+81 75 555 0307",
    email: "kyoto@ourlet.house",
    note: "A small room above a tea shop. Eight pieces on the rail at a time, changed every week.",
    services: ["Private fittings", "Mending drop-off"],
  },
];

export const faqs: Faq[] = [
  { id: "f1", group: "Orders", q: "Why are pieces numbered?", a: "Each design is made in a fixed edition — say, 120 coats. When they're gone, we don't make more of that colourway. The number on the label tells you which one is yours." },
  { id: "f2", group: "Orders", q: "Do you ever have sales or discount codes?", a: "Never. We make only what we can sell at a fair price, so there's nothing to clear. We'd rather spend that money mending your clothes for free." },
  { id: "f3", group: "Orders", q: "Can I change or cancel my order?", a: "Yes, any time before it's pressed and packed — usually within 24 hours. Write to us from the contact page with your order number." },
  { id: "f4", group: "Orders", q: "Which payment methods do you take?", a: "All major cards, Apple Pay and Google Pay. In our shops we also take cash, and in Amman, CliQ transfer." },
  { id: "f5", group: "Sizing", q: "How do I know my size?", a: "Use the Fit Guide — enter your height and chest and we'll suggest a size for each fit (close, true, relaxed, generous). Every product page also lists the garment's flat measurements, so you can compare with something you already own." },
  { id: "f6", group: "Sizing", q: "Can you adjust a piece for me?", a: "Trouser and sleeve lengths are adjusted for free in our shops. For online orders, add the length you want in the order note and we'll do it before shipping — it adds two working days." },
  { id: "f7", group: "Mending", q: "How does free mending work?", a: "Request a mend from the Mending page, post the piece to us with the free label we email you, and we repair it and send it back — usually within 3 weeks. Holes, seams, buttons, zips, re-hemming, all included. Forever." },
  { id: "f8", group: "Mending", q: "Does mending cover accidents?", a: "Yes. Moth holes, a snag on a fence, a cigarette burn, a dog with opinions. If it can be mended, we mend it." },
  { id: "f9", group: "Mending", q: "What if it can't be mended?", a: "We'll call you. Usually we can patch it with cloth from the original pattern. If not, we'll take it back for our reuse programme and give you credit toward a new piece." },
  { id: "f10", group: "Shipping", q: "Where do you ship?", a: "Everywhere except Antarctica (we tried). Shipping is free on orders over $250. Duties are included for the EU, UK, GCC and Jordan." },
  { id: "f11", group: "Shipping", q: "How is it packaged?", a: "Folded in pattern tissue, in a box made from recycled card, tied with cotton tape. No plastic, no glossy inserts — just a handwritten card from the person who pressed it." },
  { id: "f12", group: "Shipping", q: "What's your return policy?", a: "30 days, free, for anything unworn with its tissue tag. We pay the return label. Refunds go back to your card within 5 working days of the piece reaching us." },
  { id: "f13", group: "The House", q: "Where are your clothes made?", a: "Cut and sewn in our own workroom in Amman, and in summer in a small studio in Ericeira, Portugal. Every product page has a Garment Passport showing each step and who did it." },
  { id: "f14", group: "The House", q: "What does 'Ourlet' mean?", a: "It's the French word for hem — the last thing you sew on a garment and the first thing that wears out. We like that it's both an ending and a promise to keep fixing." },
  { id: "f15", group: "The House", q: "Can I visit the workroom?", a: "Yes. Book a fitting in Amman and ask to see the pattern wall. On the first Saturday of each month we run a free mending school, too." },
];

export const makers: Maker[] = [
  { name: "Lina Haddad", role: "Co-founder · Coats & tailoring", years: 12, city: "Amman", quote: "A coat should outlive its first owner." },
  { name: "Rania Khoury", role: "Pattern-cutter · Shirts & dresses", years: 9, city: "Amman", quote: "The pattern wall is our memory." },
  { name: "Omar Saleh", role: "Cutter · Workwear & linen", years: 7, city: "Ericeira", quote: "Nothing goes in our bin but thread." },
  { name: "Nour Abu-Ghazaleh", role: "Knitter · Knit room", years: 6, city: "Amman", quote: "A darn is a medal, not a mistake." },
  { name: "Samir Odeh", role: "Mending counter", years: 4, city: "Amman", quote: "I've met the same coat four times. It's like a friend." },
  { name: "Inês Moura", role: "Lisbon shop & fittings", years: 3, city: "Lisbon", quote: "I measure people, not sizes." },
];

export const houseTimeline = [
  { year: "2014", text: "Lina sews a coat for her grandfather from an old army blanket. A neighbour asks for one." },
  { year: "2016", text: "First studio: a garage in Jabal Amman, one industrial machine, one cutting table made from a door." },
  { year: "2018", text: "Rania joins and starts the pattern wall. Every pattern since is still on it." },
  { year: "2021", text: "We decide, publicly, to never hold a sale. Free mending for life starts the same week." },
  { year: "2023", text: "The Lisbon shop opens in a former bookbinder's. Omar moves to the coast to draft linen." },
  { year: "2024", text: "Chapter I — The Quiet Room. Twelve pieces, a 1974 knitting machine." },
  { year: "2026", text: "Chapter IV — Salt & Linen. 1,204 garments mended this year." },
];

export const legalDocs: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy",
    updated: "2026-08-01",
    sections: [
      { heading: "What we collect", body: "Only what we need to make and send your order: your name, email, delivery address, phone number and what you bought. If you subscribe to our letters, your email address. We don't buy data, and we don't use advertising trackers." },
      { heading: "How we use it", body: "To pack and send your pieces, to arrange mending, to answer you, and — only if you ask — to send our letters from the cutting table (roughly monthly). Your measurements, if you share them, are kept so we can alter future pieces for you." },
      { heading: "Who we share it with", body: "The courier who delivers your parcel and the payment provider who processes your card. That's all. Nobody else, ever." },
      { heading: "Your rights", body: "Ask us for a copy of everything we hold about you, or ask us to delete it, by writing to privacy@ourlet.house. We'll reply within 7 days." },
      { heading: "Cookies", body: "We use one small piece of local storage to remember your rail (basket), pinned pieces and currency. No third-party cookies." },
    ],
  },
  {
    slug: "terms",
    title: "Terms of sale",
    updated: "2026-08-01",
    sections: [
      { heading: "Prices", body: "All prices are shown in US dollars and converted at a fixed house rate for other currencies. Prices never go down in a sale and only change when the cost of cloth does — we'll note any change in our letters." },
      { heading: "Editions", body: "Each piece is made in a limited, numbered edition. The number you receive is assigned when your piece is pressed and may differ from the one shown at the time of order." },
      { heading: "Returns", body: "You may return unworn pieces within 30 days with the tissue tag attached. Altered pieces (shortened sleeves or hems) can be exchanged but not refunded." },
      { heading: "Mending for life", body: "Free mending applies to every Ourlet piece for as long as it exists, regardless of who owns it now. Second-hand counts too." },
      { heading: "Governing law", body: "These terms are governed by the laws of the Hashemite Kingdom of Jordan. If something goes wrong, write to us first — we'd much rather fix it with you." },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility",
    updated: "2026-08-01",
    sections: [
      { heading: "Our aim", body: "We want this shop to work for everyone — with a keyboard, a screen reader, zoomed to 200%, or with reduced motion turned on." },
      { heading: "What we've done", body: "All interactive elements can be reached with a keyboard and show a visible focus outline (a red dashed thread). Animations respect your device's reduced-motion setting. Colour contrast meets WCAG AA on text." },
      { heading: "Help in person", body: "If anything is hard to use, call or write to any of our shops and we'll take your order personally, by phone or email." },
    ],
  },
];
