# Image Api Demo

An image gallery API built using Next/Shadcn. Supports uploading, searching and deleting images via a simple CRUD API.

---

## 🚀 Getting Started

1. **Clone the repo**

   ```bash
   git clone xforkey/image-api-demo
   cd image-api-demo
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Start the server**

   ```bash
   npm start
   ```
4. **Open** [http://localhost:3000](http://localhost:3000) in your browser.

---

## Features

* **Upload** images using either drag‑and‑drop or file explorer
* **Client-side & server-side search** with debouncing
* **Delete** images
* **Optimized** image handling using Next `<Image>` component
* **Lazy-loading** and **placeholder blur** for smooth UX

---

## 🧰 Tech Stack

* **Next.js 15** (App Router)
* **React 19**
* **TypeScript**
* **React Query**
* **Lowdb** lightweight JSON-based store
* **shadcn/ui** Tailwind UI components

---

## 📁 Project Structure

```
app/
├─ api/v1/images/       # CRUD API handlers (GET, POST, PUT, DELETE)
├─ page.tsx             # Gallery page
├─ @modal/(.)upload/    # Intercepting route for upload modal
└─ upload/page.tsx      # Optional full-page fallback

components/
├─ GalleryClient.tsx    # Main gallery + search
├─ UploadForm.tsx       # RHF-based upload form
└─ ImageCard.tsx        # Image thumbnail + delete UI

lib/
├─ api.ts               # React Query hooks
├─ storage.ts           # File save/delete helpers
└─ db.ts                # Lowdb instance

downloads/              # Seeded image files
metadata.json           # Seeded image metadata

scripts/
└─ seed.ts              # Import initial images into lowdb
```

---

## 🎯 Future Improvements

* Further optimize Images by using sharp and blurUrls
* Add infinite scroll
* Improve search suggestions and recent search history
* Add collections
* Integrate a real database (SQLite or Postgres) instead of JSON file
* Add user authentication and image ownership
* Write automated tests for API routes and components

---

> *This README is intentionally kept concise. Reach out if you’d like more details or have any questions!*
