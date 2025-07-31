// seo.js
// Simple SEO utility for React 19 without react-helmet

// Set page title
export function setTitle(title) {
  document.title = title;
}

// Set meta description
export function setMetaDescription(description) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'description';
    document.head.appendChild(meta);
  }
  meta.content = description;
}

// Set Open Graph tags
export function setOpenGraph(title, description, image, url) {
  const tags = [
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image }
  ];

  tags.forEach(({ property, name, content }) => {
    const selector = property ? `meta[property="${property}"]` : `meta[name="${name}"]`;
    let meta = document.querySelector(selector);
    if (!meta) {
      meta = document.createElement('meta');
      if (property) meta.setAttribute('property', property);
      if (name) meta.setAttribute('name', name);
      document.head.appendChild(meta);
    }
    meta.content = content;
  });
}

// Set canonical URL
export function setCanonical(url) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

// Complete SEO setup for a page
export function setPageSEO({ title, description, image, url, canonical }) {
  setTitle(title);
  setMetaDescription(description);
  if (image && url) {
    setOpenGraph(title, description, image, url);
  }
  if (canonical) {
    setCanonical(canonical);
  }
} 