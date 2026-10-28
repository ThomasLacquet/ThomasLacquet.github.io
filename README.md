# CV-website Thomas Lacquet

Een snelle, statische site: pure HTML en CSS, eigen lettertypes, en ongeveer 1 KB JavaScript. De pagina weegt ongeveer 250 KB. Er staat bewust geen cv-pdf online (privacy: nummer en adres). Je past alles aan in een **editor met formulieren**, zonder code.

## Starten

Dubbelklik op **`start.bat`**. Er openen twee tabbladen:

- **http://localhost:4321/keystatic**: de editor
- **http://localhost:4321**: je site. Elke wijziging die je in de editor bewaart, zie je hier meteen.

Laat het zwarte venster open terwijl je werkt. De eerste keer worden de onderdelen geïnstalleerd, dat duurt ongeveer een minuut. Is je Node.js te oud, dan biedt het script aan om de nieuwe versie te installeren.

**Alleen bekijken:** `bekijk.bat` opent de laatst gebouwde versie op http://localhost:4322.

## De editor

| In de editor | Wat je daar aanpast |
|---|---|
| Settings, order & SEO | Naam, e-mail, LinkedIn, accentkleur, **volgorde en zichtbaarheid van de secties**, en de titel en beschrijving voor Google |
| Hero (top) | Profielfoto, de regel onder je naam, de intro, de feitenvakjes en de tools |
| Logos | Logo's toevoegen, verwijderen of herschikken, en per logo de hoogte |
| Experience | Haystack (stappen, het zandkleurige vlak) en je eerdere jobs |
| Selected work | Cases toevoegen, met een afbeelding per case |
| Speaking & teaching | Foto, gastcolleges en talks |
| Education, Skills, About, Contact | Spreekt voor zich |

- Lijsten herschik je door het **⋮⋮-icoon** te verslepen. Met **Add** voeg je een item toe, met het vuilnisbakje verwijder je er een.
- Klik op **Save** rechtsboven. De wijziging wordt bewaard in de map `content/`.
- Foto's laad je op met **Choose file**. Gebruik bij voorkeur JPG of WebP onder 300 KB.

## Live zetten

1. Voer `npm run build` uit, of laat Claude dat doen. Dat maakt de map `dist/`: de volledige site, zonder de editor.
2. Sleep `dist/` naar https://app.netlify.com/drop. Koppel daarna je domein bij Domain settings.

Werk je met GitHub en Netlify of Cloudflare Pages, gebruik dan als build command `npm run build` en als output map `dist`. Na elke push staat de wijziging binnen een minuut online.

## Voor je live gaat

- [ ] Vul de invulvelden tussen `[HAKEN]` in. Ze staan in de editor, onder andere bij de cases en de gastcolleges.
- [ ] Vraag Haystack om toestemming voor het noemen van ING en het tonen van het ING-logo. Vraag ook je collega of hij op de foto mag.
- [x] Online op https://thomaslacquet.github.io (GitHub Pages, gratis). Bij een eigen domein: vervang `thomaslacquet.github.io` in `astro.config.mjs`, `public/robots.txt`, `public/sitemap.xml` en `public/llms.txt`.

## Gevonden worden (SEO en GEO)

Dit zit al in de site: een paginatitel en beschrijving (aanpasbaar in de editor), een preview voor LinkedIn, gestructureerde data voor Google, `robots.txt`, `sitemap.xml` en `llms.txt` voor AI-assistenten.

Na de livegang:

1. Voeg de site toe aan Google Search Console en dien je sitemap in.
2. Zet de link op je LinkedIn-profiel.

## Bedieningspaneel
Dubbelklik op **start.bat**. Zodra alles klaar is, opent je browser vanzelf het bedieningspaneel (`http://localhost:4321/start`) met: de editor (en knoppen per sectie, Engels en Nederlands), een voorbeeld van de site, een QR-code voor je telefoon, en de knop **Zet online**.

## Online zetten
De site staat op **https://thomaslacquet.github.io** (gratis via GitHub Pages). Pas je iets aan in de editor en ben je tevreden? Dubbelklik op **publiceer.bat**. Het script controleert eerst of de site bouwt en zet hem dan online; na ongeveer een minuut staat de nieuwe versie live.

De eerste keer installeert het (na je akkoord) git en vraagt GitHub je in te loggen in je browser. Daarna gaat het met één dubbelklik. Je kan ook gewoon aan Claude vragen om het online te zetten.
