# Paws Animal Rescue Website

## 1. Project Overview

Paws Animal Rescue is a fictional non-profit animal rescue organisation based in Cape Town, South Africa. It rescues abandoned, neglected and abused animals and helps them find safe, permanent homes.

The website gives Paws a friendly online presence. Visitors can learn about the organisation, browse animals available for adoption, read about rescue services, enquire about adopting, fostering, volunteering or sponsoring, and contact the organisation.

The website was developed as part of an academic web development project (Parts 1–3).

**Live website:** <https://zipho-r.github.io/Animal-Rescue-Website-Part-2/>  
**Repository:** <https://github.com/Zipho-R/Animal-Rescue-Website-Part-2>

---

## 2. Organisation

| | |
|---|---|
| **Name** | Paws Animal Rescue |
| **Type** | Non-Profit Organisation (NPO) |
| **Location** | Cape Town, South Africa (Diep River and Table View branches) |
| **Mission** | To protect vulnerable animals by providing rescue, care, rehabilitation and adoption services, while teaching the community about responsible pet ownership. |
| **Vision** | A Cape Town where every pet is wanted, sterilised and cared for, and where no animal is left abandoned, neglected or alone. |

---

## 3. Website Goals

- Increase awareness of animal rescue and welfare in Cape Town.
- Let visitors browse, search and filter animals available for adoption.
- Encourage adoption, fostering, volunteering and sponsorship.
- Give instant cost and availability information through the enquiry form.
- Make it easy to contact the organisation by email, phone or in person.
- Work well on desktop, tablet and mobile devices.

---

## 4. Target Audience

People interested in adopting a pet, animal lovers, potential volunteers, sponsors and donors, foster families, members of the Cape Town community, and anyone looking for information on animal welfare.

---

## 5. Website Pages

| Page | File | Main content |
|---|---|---|
| Home | `index.html` | Hero, moving ticker, introduction, services preview, **searchable animal directory with profile pop-ups**, adoption steps, testimonial, call to action |
| About Us | `about.html` | Our story, mission and vision, values, milestones timeline, team, **photo gallery with lightbox** |
| Services | `services.html` | Six services, **"Ways to help" tabs** with fees, adoption information, **FAQ accordion** |
| Enquiry | `enquiry.html` | Ways to get involved, **enquiry form** with validation, AJAX submission and a cost/availability response |
| Contact | `contact.html` | Two branch locations, **interactive Leaflet map**, **contact form that compiles an email**, opening hours |

---

## 6. Sitemap

```
Paws Animal Rescue
├── Home ............ index.html
├── About Us ........ about.html
├── Services ........ services.html
├── Enquiry ......... enquiry.html
└── Contact ......... contact.html
```

A machine-readable version for search engines is in `sitemap.xml`.

---

## 7. File and Folder Structure

```
Animal-Rescue-Website/
├── index.html
├── about.html
├── services.html
├── enquiry.html
├── contact.html
├── robots.txt            ← instructions for search engine crawlers
├── sitemap.xml           ← list of pages for search engines
├── _headers              ← security and caching headers (Netlify)
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── animals.js        ← animal data used to build the adoption cards
│   └── script.js         ← all interactive features and form handling
└── images/
    ├── labrador-buddy.jpg, tabby-cat-luna.jpg, ... (descriptive names)
    └── responsive/       ← 480w, 800w and 1200w versions of each photo
```

---

## 8. Technologies Used

- **HTML5**: semantic structure (`header`, `nav`, `main`, `section`, `article`, `aside`, `figure`, `footer`), forms and ARIA attributes.
- **CSS3**: custom properties (variables), Flexbox, Grid, `aspect-ratio`, `object-fit`, keyframe animations, media queries and `prefers-reduced-motion`.
- **JavaScript (ES6+)**: DOM manipulation, event delegation, `IntersectionObserver`, the Fetch API (AJAX), `FormData`, `URLSearchParams` and the Clipboard API.
- **Leaflet 1.9.4** with **OpenStreetMap** tiles for the interactive map.
- **Google Fonts**: Fredoka (headings) and Nunito (body text).
- **JSONPlaceholder**: a free test API used to demonstrate AJAX form submission.

---

## 9. Design and Colour Scheme

Part 3 replaced the softer green/cream palette with a brighter, happier one built on four colours:

| Colour | Hex | Use |
|---|---|---|
| Orange | `#FF6A00` | Buttons, highlights and banners |
| Green | `#00A651` / dark `#007F3F` | Tags, links and the call-to-action band |
| Black | `#111111` | Text, outlines and the moving ticker |
| White | `#FFFFFF` | Main background |

Pale tints of orange and green separate the sections. Black text is used on orange and bright green, and white text only on dark green or black, so all text meets WCAG contrast guidelines.

Rounded fonts, thick black outlines and "sticker" shadows give the site a cheerful, playful character that suits a happy rescue organisation. A repeating paw-print pattern, a moving word ticker, gently floating banner photos and a scroll reveal add motion and fill the empty spaces. All animations stop automatically for visitors who turn on "reduce motion" in their device settings.

---

## 10. Part 3: Functionality (JavaScript)

| Requirement (Part 3 brief) | Where it is implemented |
|---|---|
| Accordion | FAQ on `services.html` (one +/× icon per question; opening one closes the others; keyboard accessible) |
| Tabs | "Ways to help" on `services.html` (Adopt / Foster / Volunteer / Sponsor; arrow-key navigation) |
| Modal | Animal profile pop-up on `index.html` (Escape to close, focus kept inside, returns focus afterwards) |
| Interactive map | Leaflet + OpenStreetMap on `contact.html`; "Show on map" buttons fly the map to each branch |
| Animations and transitions | Moving ticker, floating banner photos, scroll reveal, button and card hover effects, pop-in dialogs |
| Advanced DOM manipulation | Animal cards, filters, profile modal, lightbox, enquiry results and email preview are all built with `createElement`, `replaceChildren` and `textContent` |
| Gallery with lightbox | "Life at Paws" gallery on `about.html` (previous/next buttons, arrow keys, captions) |
| Dynamically loaded content | Adoption cards (`index.html`) and the animal list in the enquiry form are generated from `js/animals.js` |
| Search, filter and sort | Animal directory: search by name or trait, filter dogs/cats, sort by name, age or fee |

---

## 11. Part 3: Forms and Validation

### Enquiry form (`enquiry.html`)
Lets visitors enquire about **adopting, fostering, volunteering, sponsoring** or a general question.

- **Smart fields:** only the relevant fields appear for each enquiry type (animal list, sponsorship amount, volunteer area, visit date).
- **Validation:** required fields; names (letters only, 2–50 characters); email format; South African phone format (`082 123 4567` or `+27 82 123 4567`), which becomes required if "Phone call" is chosen; a visit date from tomorrow to 60 days ahead and not on a Sunday; a sponsorship amount from R50 to R50 000; a message of 20–1 000 characters with a live counter; and a consent checkbox.
- **Error handling:** a clear red message under each field, live re-checking as the visitor types, and focus moved to the first problem.
- **AJAX submission:** valid data is sent in the background with `fetch()` to the URL in the form's `action` attribute (`https://jsonplaceholder.typicode.com/posts`), without reloading the page. The returned ID creates a reference number.
- **Processed response:** the visitor sees the **cost** (adoption fee, sponsorship total and what it pays for, or free for fostering and volunteering), **availability** (whether the animal is available or reserved, meet-and-greet times for the chosen day, volunteer shifts) and the next steps. If the server cannot be reached, the response is still shown with a note.
- Arriving from an "Apply to adopt" button pre-fills the enquiry type and animal.

### Contact form (`contact.html`)
For general messages to the organisation.

- Fields: full name, email, optional phone, **type of message** (general, lost/found animal, visit, donation, feedback, media) and subject, plus a full message (20–1 500 characters).
- After validation, the details are **compiled into an email** addressed to `hello@pawsrescue.co.za` (set in `js/script.js`). The visitor sees a preview and can press **Send with my email app** (a `mailto:` link with the subject and body filled in) or copy the text.
- The form's `action` is `mailto:hello@pawsrescue.co.za`, so it still works as a basic email form if JavaScript is off.

---

## 12. Part 3: Search Engine Optimisation (SEO)

### On-page SEO
- **Keyword research:** target phrases were chosen for local searches, such as *animal rescue Cape Town*, *adopt a dog Cape Town*, *adopt a cat*, *foster animals Cape Town*, *volunteer at animal shelter* and *pet adoption fees*. They appear naturally in titles, headings, descriptions and body text.
- **Title tags and meta descriptions:** each page has a unique title under 60 characters and a description under 160 characters.
- **Header tags:** each page has exactly one `<h1>`, followed by `<h2>` section headings and `<h3>` card headings.
- **Image optimisation:** images were renamed descriptively (for example `dog-2.jpg` became `labrador-buddy.jpg`), compressed, and given detailed alt text, `width`/`height` attributes and responsive `srcset` versions.
- **Clean URLs:** short, lowercase, descriptive file names (`about.html`, `services.html`, and so on).
- **Internal linking:** contextual links between pages (service cards link to `services.html#…`, footer links to the enquiry form, contact page and FAQs, "Apply to adopt" links to the enquiry form). The footer does not repeat the main navigation links..
- **Mobile-friendliness:** responsive layouts at 1000px, 760px and 420px, a mobile menu, and touch-sized buttons.

### Off-page SEO
- **Social media:** Open Graph and Twitter Card tags so shared links display a title, description and image.
- **Local SEO:** `AnimalShelter` structured data (JSON-LD) with both addresses, phone number and opening hours; `geo` meta tags; addresses, phone numbers and the map on the Contact page.
- **Backlinks (plan):** listing Paws on Cape Town pet directories, local vet and pet shop partner websites, and community notice boards; guest posts on local pet blogs; and the deployed site link in social media bios.

### Additional requirements
- **robots.txt:** allows all pages to be crawled and points to the sitemap.
- **sitemap.xml:** lists all five pages with priorities and last-modified dates.
- **Page speed:** compressed images in 480/800/1200px sizes, lazy loading below the fold, `fetchpriority="high"` on the main image, deferred scripts, font `preconnect` with `display=swap`, and cache headers in `_headers`.
- **Security:** a Content-Security-Policy restricts which sites can supply scripts, styles, images and form submissions; Subresource Integrity on the Leaflet files; `rel="noopener noreferrer"` on external links; all visitor input is shown with `textContent` (never `innerHTML`) to prevent cross-site scripting; input lengths are limited; and security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, HSTS) are set in `_headers`.

`robots.txt` and `sitemap.xml` point to the live address: `https://zipho-r.github.io/Animal-Rescue-Website-Part-2/`.

---

## 13. Accessibility

Skip-to-content link; visible keyboard focus; labelled form fields with `aria-describedby` errors and hints; `aria-expanded`, `aria-controls`, `aria-selected` and `role="dialog"` on interactive components; focus trapped inside dialogs and returned afterwards; descriptive alt text; WCAG-compliant colour contrast; and reduced-motion support.

---

## 14. Testing

The website was tested in a browser at desktop (1366px) and mobile (390px) widths. The checks covered:

- Navigation and the mobile menu on every page.
- Search, filter and sort in the animal directory (including the "no results" message).
- Animal profile pop-ups (correct photo and details, Escape and close button).
- The FAQ accordion (one icon per question, only one open at a time) and the tabs.
- The gallery lightbox (next/previous, arrow keys, Escape).
- Enquiry form: invalid entries show the correct error messages; valid entries show the cost/availability response; pre-filling from "Apply to adopt" works.
- Contact form: validation errors, the compiled `mailto:` link and the email preview.
- No horizontal scrolling on mobile; no JavaScript errors in the console.
- Every page has one `<h1>`, no duplicate IDs, alt text on all images and no broken local links.

### Screenshot Evidence
_Add screenshots of the desktop, tablet and mobile views here (for example `screenshots/desktop.png`, `screenshots/tablet.png`, `screenshots/mobile.png`)._

---

## 15. Deployment

1. Push all files to the GitHub repository.
2. **Vercel (chosen host):** vercel.com → Add New → Project → import this GitHub repository → Framework preset *Other*, no build command → Deploy. Vercel redeploys automatically on every push to `main`.
   **or GitHub Pages:** Settings → Pages → Source: *Deploy from a branch* → `main` / root → Save.
   **or Netlify:** Add new site → Import from GitHub → choose the repository → Deploy (no build command needed; `_headers` is applied automatically).
3. The live link (`https://zipho-r.github.io/Animal-Rescue-Website-Part-2/`) is already set in this README, `robots.txt` and `sitemap.xml`.
4. Optional: submit `sitemap.xml` in Google Search Console.

---

## 16. Future Improvements

Online donations, a real database and admin dashboard for animals, volunteer accounts, online booking for meet-and-greets, a newsletter, and server-side email delivery for both forms.

---

## 17. Changelog

### Part 3 Edits: Enhancing Functionality and SEO

#### Summary of improvements from Part 2

| Area | Part 2 | Part 3 |
|---|---|---|
| Colour scheme | Muted green, coral, yellow, pink and cream | Bright orange `#FF6A00`, green `#00A651`, black and white with WCAG-compliant contrast |
| Typography | Arial / system fonts | Google Fonts: Fredoka (headings) and Nunito (body) |
| Images | Generic names (`dog-2.jpg`, `team1.jpg.webp`), some mismatched with their text, blank bands from `object-fit: contain` | Descriptive names (`labrador-buddy.jpg`), photos matched to names/ages/alt text, fixed-shape frames with `object-fit: cover`, regenerated 480/800/1200w versions |
| Home page | Static featured-animal cards | Searchable, filterable and sortable animal directory built from `js/animals.js`, with profile pop-ups, ticker, adoption steps and testimonial |
| About page | Story, mission, values, team | Adds milestones timeline, team bios and a photo gallery with lightbox |
| Services page | Six service cards | Adds "Ways to help" tabs with fees and a FAQ accordion (double "+" icon fixed) |
| Enquiry form | Required-field check and a generic confirmation | Conditional fields, format validation, per-field errors, AJAX `fetch()` submission and a cost/availability response |
| Contact form | Required-field check only; map placeholder | Message-type field, validation, compiled `mailto:` email with preview; working Leaflet map (missing script added) |
| SEO | Basic titles, no meta descriptions strategy, no robots/sitemap | Keyword-based titles and descriptions, Open Graph/Twitter tags, JSON-LD local business data, `robots.txt`, `sitemap.xml` |
| Security and speed | None | Content-Security-Policy, `_headers` security/cache headers, SRI on Leaflet, `textContent` output, lazy loading, deferred scripts |

The interim commit "Add interactive Part 3 website features" (an early draft of the contact map, homepage and services changes) was replaced by the final versions of those files described below.

#### Corrections and feedback-related fixes
- **FAQ showed two plus signs:** the CSS drew a "+" with `.faq-question::after` and the HTML also contained a `+` span. The `::after` rule was removed, so each question now has one round +/× icon that rotates when opened. Each question is linked to its answer with `aria-controls`.
- **Animal profile images displayed badly:** the pop-up photo was forced to `object-fit: cover` in a narrow column with a 420px minimum height, so photos were heavily cropped. The pop-up now shows the whole photo (`object-fit: contain`) above the details at full resolution using `srcset`, with Dog/Cat and availability badges.
- **Wrong photos on animals:** Buddy (3 years) had a puppy photo and Milo (8 months) had an adult Labrador photo. The photos were swapped to match the descriptions.
- **Empty spaces around images:** all images used `object-fit: contain`, which left blank bands. Content images now sit in fixed-shape frames with `object-fit: cover`, so cards in a row are always the same height.
- **Homepage introduction layout:** the intro container was missing the `two-column` class, so the image and text were stacked with a large gap. Fixed.
- **Map never appeared:** `contact.html` loaded the Leaflet CSS but not the Leaflet JavaScript file. The script was added (with Subresource Integrity), plus a text fallback if the map cannot load.
- **Blurry hero image:** a 640px image was stretched across the full screen. The hero was redesigned around a 1 600px photo.
- **Mismatched images and alt text on the Services page:** the "Animal Rescue" card showed the rehabilitation photo and vice versa. Images and alt text now match each service.
- **Team details:** "Daniel Jacobs" was shown with a photo of a woman; renamed to Danielle Jacobs.
- **Unused file:** `volunteer.jpg` (a phone screenshot) was not used on any page and was removed.
- _Add any further specific comments from your Part 2 lecturer feedback here, with what you changed._

#### Design
- New brighter palette of orange, green, black and white (see Section 9), replacing the muted greens, coral and cream.
- Added Google Fonts (Fredoka and Nunito) for a friendlier look than Arial.
- Filled empty spaces with more content and motion: a moving word ticker, circular photos in every page banner, a paw-print background pattern, an adoption steps section, a testimonial, a milestones timeline and a photo gallery.
- Added more text throughout: longer introductions, card descriptions, team bios, location details and six FAQs.

#### Functionality (JavaScript)
- Animal directory rebuilt from data in `js/animals.js` (dynamic content). Added two more animals (Daisy and Snowy) and a bonded pair (Pip & Pepper) using existing images, an extra "Lowest fee" sort option, trait search and a "no results" message.
- Added interactive tabs, a gallery lightbox and a scroll reveal.
- Map: branch markers fit the view automatically; "Show on map" buttons on each location card.
- Opening hours highlight today's day automatically.
- Mobile menu button now updates `aria-expanded` and switches between ☰ and ✕.

#### Forms
- Enquiry form: conditional fields, full format validation, per-field error messages, live character counter, AJAX submission with `fetch()`, and a cost/availability response (see Section 11).
- Contact form: added phone and message-type fields, validation and error messages, and compiling the message into an email with a preview and a `mailto:` send button.
- Both forms now have `action` and `method` attributes.

#### SEO and performance
- Rewrote every title tag and meta description around researched keywords; added keyword, Open Graph, Twitter Card and geo meta tags.
- Added `AnimalShelter` structured data (JSON-LD) for local SEO.
- Renamed all images descriptively; regenerated compressed responsive versions; added `width`/`height`, lazy loading and `fetchpriority`.
- Added `robots.txt` and `sitemap.xml`.
- Scripts now load with `defer`.

#### Security
- Added a Content-Security-Policy and referrer policy meta tags on every page, `_headers` with security headers, Subresource Integrity on Leaflet, `rel="noopener noreferrer"` on external links, and safe `textContent` output for all user input.

#### Home page and footer clean-up
- **Removed the made-up statistics:** the green statistics band on `index.html` (1 240+ animals rehomed, 180 volunteers, 65 foster families, 2 branches) and the two floating stickers on the hero photo ("1 240+ happy adoptions" and "6 pets waiting for you") were removed, because the figures were not real. The unused counter script and the stats/sticker styles were deleted from `js/script.js` and `css/style.css`.
- **Simpler footer on every page:** the footer now has only three columns: *Get involved* (adopt, volunteer or foster, sponsor, contact), *Visit us* (both addresses, phone and email) and *FAQs* (link to the adoption FAQs). The logo, tagline and social media icons were removed, and the "Explore" links (Home, About us, Our services) were removed because they repeat the navigation bar.

#### Documentation
- README updated with Part 3 functionality, forms, SEO, deployment instructions, this changelog and a references list.

### Part 2 Edits

- **Relative units for spacing (Section 3.2 of the brief):** Converted every `padding`, `margin` and `gap` value in `css/style.css` from fixed pixel values to `rem` units (base 16px), so that spacing scales consistently with the root font size rather than being fixed in pixels. The header's fixed height (`min-height`) and the mobile navigation dropdown's matching `top` offset were converted together, since the second value depends on the first. Font sizes already used `rem`/`clamp()` and were left as-is. Border widths, border-radius, box-shadow offsets and fixed icon/image dimensions were intentionally left in pixels, as these are decorative/structural values rather than spacing.

- **Responsive images with `srcset`, `sizes` and `<picture>` (Section 3.3 of the brief):** Previously, all `<img>` elements linked directly to a single full-size source file, so mobile devices downloaded the same large image as desktop. Using Python/Pillow, smaller width variants (480w, 800w and, where the source was large enough, 1200w) were generated for every content image and saved to `images/responsive/`. Every `<img>` tag on `index.html`, `about.html` and `services.html` was updated with a `srcset` and `sizes` attribute so the browser can choose the most appropriately sized image for the viewport. The two large "story" images (on the homepage introduction and the About Us page) were additionally wrapped in a `<picture>` element to demonstrate that responsive image technique specifically.

- **Changelog section added:** Added this Changelog section to the README so that future edits (including corrections from marker feedback) can be recorded here, as required by the Part 2 brief.

- **Screenshot evidence placeholder added:** Added a "Screenshot Evidence" subsection under Testing (Section 16) noting the breakpoints tested and where screenshots of desktop/tablet/mobile views should be inserted. Actual screenshots still need to be captured directly from a browser's device toolbar and added to the repository, since this is evidence of the student's own manual testing process.

### Notes

The CSS reset, base styles, typography scale, Flexbox/Grid layout, `:hover`/`:focus`/`:active` interactive states, and the tablet/mobile media query breakpoints (1000px and 700px) from Part 1 were reviewed and found to already satisfy the Part 2 requirements, so they were left unchanged.

---

## 18. References

Google, 2026. *Create and submit a sitemap*. [online] Google Search Central. Available at: <https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap> [Accessed 2 November 2026].

Google, 2026. *Introduction to robots.txt*. [online] Google Search Central. Available at: <https://developers.google.com/search/docs/crawling-indexing/robots/intro> [Accessed 2 November 2026].

Google, 2026. *Search Engine Optimization (SEO) Starter Guide*. [online] Google Search Central. Available at: <https://developers.google.com/search/docs/fundamentals/seo-starter-guide> [Accessed 2 November 2026].

Google Fonts, 2026. *Fredoka* and *Nunito*. [online] Available at: <https://fonts.google.com> [Accessed 2 November 2026].

JSONPlaceholder, 2026. *Free fake and reliable API for testing and prototyping*. [online] Available at: <https://jsonplaceholder.typicode.com> [Accessed 2 November 2026].

Leaflet, 2026. *Leaflet: an open-source JavaScript library for interactive maps* (version 1.9.4). [online] Available at: <https://leafletjs.com> [Accessed 2 November 2026].

MDN Web Docs, 2026. *Client-side form validation*. [online] Mozilla. Available at: <https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation> [Accessed 2 November 2026].

MDN Web Docs, 2026. *Content Security Policy (CSP)*. [online] Mozilla. Available at: <https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP> [Accessed 2 November 2026].

MDN Web Docs, 2026. *Using the Fetch API*. [online] Mozilla. Available at: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch> [Accessed 2 November 2026].

MDN Web Docs, 2026. *Intersection Observer API*. [online] Mozilla. Available at: <https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API> [Accessed 2 November 2026].

Netlify, 2026. *Custom headers*. [online] Available at: <https://docs.netlify.com/routing/headers/> [Accessed 2 November 2026].

OpenStreetMap contributors, 2026. *OpenStreetMap*. [online] Available at: <https://www.openstreetmap.org/copyright> [Accessed 2 November 2026].

Schema.org, 2026. *AnimalShelter*. [online] Available at: <https://schema.org/AnimalShelter> [Accessed 2 November 2026].

W3C, 2024. *ARIA Authoring Practices Guide: Accordion, Tabs and Dialog (Modal) patterns*. [online] Available at: <https://www.w3.org/WAI/ARIA/apg/patterns/> [Accessed 2 November 2026].

### Image references
All photographs in the `images` folder were found through a Google Images search. They are used for educational, non-commercial purposes only and remain the property of their original owners. Files were renamed descriptively and resized for this project.

Google Images, 2026. *Cat recovering with a bandaged paw* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/cat-recovering-with-bandaged-paw.jpg`)

Google Images, 2026. *Family adopting a rescue dog* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/family-adopting-rescue-dog.jpg`)

Google Images, 2026. *Feeding a rescued dog and cat* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/feeding-rescued-dog-and-cat.jpg`)

Google Images, 2026. *Foster family with a rescue dog* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/foster-family-with-rescue-dog.jpg`)

Google Images, 2026. *Golden puppy running* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/golden-puppy-daisy-running.jpg`)

Google Images, 2026. *Golden retriever puppy* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/golden-retriever-puppy-milo.jpg`)

Google Images, 2026. *Labrador dog* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/labrador-buddy.jpg`)

Google Images, 2026. *Animal shelter volunteer team* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/paws-volunteer-team.jpg`)

Google Images, 2026. *Tabby cat* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/tabby-cat-luna.jpg`)

Google Images, 2026. *Portrait photograph used for a team member* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/team-danielle-jacobs.jpg`)

Google Images, 2026. *Portrait photograph used for a team member* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/team-mia-petersen.jpg`)

Google Images, 2026. *Portrait photograph used for a team member* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/team-sarah-williams.jpg`)

Google Images, 2026. *Veterinarians examining a rescue dog* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/vets-examining-rescue-dog.jpg`)

Google Images, 2026. *Volunteer hugging a rescue dog* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/volunteer-hugging-rescue-dog.jpg`)

Google Images, 2026. *White kitten* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/white-kitten-snowy.jpg`)

Google Images, 2026. *Pair of Yorkshire terriers* [Photograph]. Available at: <https://images.google.com> [Accessed September 2026]. (`images/yorkie-pair-pip-and-pepper.jpg`)
