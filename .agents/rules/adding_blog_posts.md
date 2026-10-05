---
name: adding_blog_posts
description: Standard operating procedure for adding a new blog post to the Nearby Studio website.
---

# Adding a Blog Post

When the user asks you to add a new blog post and provides the content, you MUST follow these exact steps to ensure the post is integrated correctly and SEO-optimized:

1. **Create the Blog Component**: 
   - Create a new file in `src/pages/` named `BlogPost<Topic>.jsx`.
   - Use `src/pages/BlogPostThreePointLighting.jsx` as a structural template.
   - You MUST import and include the `<SEO />` component (`import SEO from '../components/SEO';`) right after the opening Fragment `<>`.
   - Set the `<SEO />` props: `title="{Blog Title} | Nearby Studio"`, `description="{A short 1-2 sentence excerpt}"`, and `type="article"`.

2. **Update App Routes**:
   - In `src/App.jsx`, add a lazy import for the new component.
   - Add a new `<Route>` inside the `<Routes>` block (e.g., `<Route path="/blog/your-url-slug" element={<BlogPostYourTopic />} />`).

3. **Update the Blog List**:
   - In `src/pages/BlogList.jsx`, add a new entry to the TOP of the `postsData` array.
   - Provide the `path` (matching the route in App.jsx), `title`, `excerpt`, current `date`, and `author: "Nearby Studio"`.

4. **Update the Sitemap**:
   - Run `npm run sitemap`. It regenerates `public/sitemap.xml` from the routes in `src/App.jsx` (it also runs automatically on `npm run build`). Do not edit the sitemap by hand.

Follow all of these steps sequentially whenever a new blog post is requested.
