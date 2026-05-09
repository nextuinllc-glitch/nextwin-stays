# NEXTWIN STAY — Catalog photos

Drop the WhatsApp catalog photos for each listing into the matching folder
below, then run **one** script that wires them into the site.

## Folder list

| Folder name             | Public listing on the site                                       |
| ----------------------- | ---------------------------------------------------------------- |
| `Appt 54`               | Studio 54 Marrakech — Vue Piscine & Terrasse Glamour             |
| `Appt D32`              | Studio D32 Marrakech — Design Urbain Vue Piscine                 |
| `Appart 36`             | Studio 36 Marrakech — Standing Royal Vue Piscine                 |
| `Appt Duplex 26`        | Appartement Duplex 26 Marrakech — Double Hauteur & Patio Privé   |
| `Appart 22`             | Appartement Duplex 22 Marrakech — Moderne & Cosy                 |
| `Villa Prestige`        | Villa Prestige Marrakech — 4 Chambres, Piscine Chauffée          |
| `Appart 39`             | Appartement 39 Marrakech — Luxe Authentique & Piscine            |
| `Appart 84`             | Appartement 84 Marrakech — Premium Terrasse Vue Ville            |
| `Appt 63`               | Appartement 63 Marrakech — Luxe avec Terrasse & Piscine          |
| `Appt 57`               | Appartement 57 Marrakech — Moderne & Entièrement Équipé          |
| `Appartement Gueliz`    | Appartement Gueliz Marrakech — Luxe & Modernité au Cœur Ville    |
| `Appt 76`               | Appartement 76 Marrakech — Luxe au Cœur de la Perle              |

## How to upload

1. Open the folder for the listing you want to update.
2. Drag your WhatsApp photos in. Any name works — `IMG_4321.jpg`, `01.jpg`,
   `salon.jpeg` — but **the order is alphabetical**, so prefix with
   `01_`, `02_`, `03_` if you want a specific order on the site.
3. Accepted formats: `.jpg`, `.jpeg`, `.png`, `.webp`. Anything else is
   skipped silently.
4. There is no per-folder limit, but keep individual files under ~10 MB
   for fast page loads (use Preview → Export → JPEG → 80% if needed).

## How to run the import

From the project root:

```bash
npx tsx prisma/scripts/import-catalog-photos.ts
```

What it does, per folder that has at least one image:

1. Looks up the matching property by slug (the table above is hardcoded
   in the script).
2. Copies each image to `public/uploads/cat/<slug>/<NN-original-name>`.
3. **Wipes the placeholder photos** for that property in the database.
4. Inserts the new images in alphabetical order.

Re-runs are safe — the script always wipes-then-inserts for any folder it
finds photos in. Folders left empty are skipped, so the placeholders for
those listings stay until you fill them.

## What the script does NOT do

- It doesn't change titles, descriptions, prices, or `published` status —
  only photos. Edit those via `/admin/properties/[id]` as before.
- It doesn't delete files from `public/uploads/cat/<slug>/` after a
  re-run; old files just stop being referenced by the DB. Disk grows
  slowly until you `rm -rf public/uploads/cat` to start fresh.
- It doesn't upload to a CDN — for production you'll want to swap the
  copy step for an S3/R2/Cloudinary `putObject`.

## After running

Visit `http://localhost:3000/properties` — your listing cards now show
the real photos instead of the placeholder.
