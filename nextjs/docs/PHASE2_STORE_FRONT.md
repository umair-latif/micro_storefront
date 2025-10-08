# 📘 Micro Storefront – Phase 2: Public Storefront Redesign

## 📦 Project Overview

This project is a **Next.js + Supabase micro-storefront platform** where users can create lightweight storefront pages with:

- Profile pages with social links and branding
- Product listings and categories
- Instagram-style UI or Linktree-like layouts
- Built-in CTAs and external links

The **backend and admin dashboard are now feature-complete.**  
This document describes how to approach **Phase 2**: the full **redesign and overhaul of the public storefront (`/[slug]`)**.

---

## ✅ Current State (Post-Admin Overhaul)

### 🧰 Tech Stack

- **Next.js (App Router)** with **TypeScript**
- **Supabase** (auth, database, storage)
- **Tailwind CSS**
- **Lucide React** for icons

---

## 📁 Database Schema (Finalized for Storefront)

### `profiles`

| Column | Type | Purpose |
|--------|------|----------|
| `id` | uuid | PK |
| `slug` | text | public storefront URL (`/slug`) |
| `display_name` | text | store name |
| `bio` | text | short description |
| `profile_img` | text | avatar image URL |
| `header_img` | text | cover/header image URL |
| `wa_e164` | text | WhatsApp contact |
| `ig_handle` / `tt_handle` | text | legacy handles (still updated) |
| `socials_config` | jsonb | ✅ scalable social links (Instagram, TikTok, X, Facebook, Etsy, Amazon, YouTube) |
| `storefront_config` | jsonb | customizable storefront settings (themes, layout modes, etc.) |
| `owner_uid` | uuid | FK to user (for RLS) |

---

### `categories`

| Column | Type | Purpose |
|--------|------|----------|
| `id` | uuid | PK |
| `profile_id` | uuid | FK to `profiles` |
| `name` | text | category name |
| `position` | int | optional ordering |
| `created_at` | timestamp | creation timestamp |

---

### `products`

| Column | Type | Purpose |
|--------|------|----------|
| `id` | uuid | PK |
| `profile_id` | uuid | FK to `profiles` |
| `category_id` | uuid | FK to `categories` |
| `title` | text | product name |
| `price` | numeric | product price |
| `caption` | text | description |
| `thumb_url` | text | image |
| `instagram_permalink` | text | Instagram link |
| `cta_label` | text | custom CTA label |
| `cta_url` | text | custom CTA link |
| `visible` | boolean | ✅ toggle product visibility |
| `created_at` | timestamp | creation timestamp |

---

## 🧰 Admin-Side Features (Now Functional)

The following are now implemented in the admin dashboard and **must be reflected in the public storefront:**

- ✅ Store **profile image** and **cover image** upload/delete  
- ✅ Editable **display name**, **bio**, and **WhatsApp contact**  
- ✅ Scalable **social links** via `socials_config`  
- ✅ Categories (sortable highlight circles)  
- ✅ Product CRUD with:  
  - Image upload/delete  
  - CTA label + URL  
  - Category selector  
  - `visible` toggle  
- ✅ Modal-based editing and mobile-optimized forms  
- ✅ RLS and Supabase storage buckets configured  

---

## 🎯 Phase 2 Goal: Public Storefront Overhaul

Redesign the storefront UI (`/[slug]`) to fully leverage the new data and admin features.  
This storefront must be visually appealing, mobile-first, and flexible enough to evolve into a mini **link-in-bio microsite builder.**

---

## 🧱 Core Components to Build

### 1. 🖼️ Header Section

- Render `header_img` as a **cover image** with a gradient overlay.
- Show `profile_img` avatar overlapping the cover.
- Display `display_name` and `bio`.
- Show WhatsApp CTA button if `wa_e164` is provided.
- Render social icons dynamically from `socials_config`.

---

### 2. 🗂️ Categories Section

- Horizontal scrollable highlight circles.
- Optional category names below each circle.
- Clicking a category filters the product list.

---

### 3. 🛍️ Products Section – Support 3 Display Modes

Controlled by `storefront_config.layout_mode` (future-ready):

| Mode | Description | Use case |
|------|-------------|----------|
| **Grid** (default) | Instagram-style 2-column grid. Image card → caption → price → CTA. | Visual product catalog |
| **List** | Image left, text + CTA right. | Detailed product listings |
| **Link-style** | Title + button only (no image). | Affiliate links, digital content, external stores |

Additional rules:
- Hide products where `visible = false`.
- Show CTA button if `cta_label` + `cta_url` exist.
- Show Instagram + WhatsApp icons if data is available.

---

### 4. 📱 Mobile UX & Responsiveness

- Smooth responsive design across mobile, tablet, and desktop.
- Modal content must scroll correctly on small screens.
- Optional sticky CTA bar (e.g., WhatsApp or Contact button).

---

### 5. 🎨 Future Theming Support (Prepare Now)

The `storefront_config` JSONB will later include:

| Key | Type | Description |
|-----|------|-------------|
| `theme` | text | light / dark / glass |
| `primary_color` | text | hex or Tailwind token |
| `button_style` | text | rounded / pill / sharp |
| `layout_mode` | text | grid / list / link |

Design the storefront with this **config-driven system in mind** for easy future expansion.

---

## 📁 Suggested File Structure