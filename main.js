// Theme selection and dynamic loading
(async function() {
  const availableThemes = ['bulky', 'kubrik', 'bright', 'dark', 'minimal', 'dark-mint', 'vibrant', 'mossy'];
  const params = new URLSearchParams(window.location.search);
  let theme = params.get('theme');
  
  // If no theme in URL, try to get it from config.json
  if (!theme) {
    try {
      const response = await fetch('config.json');
      const config = await response.json();
      theme = config.theme;
    } catch (error) {
      console.error('Error loading config.json:', error);
    }
  }
  
  // Normalize and validate
  if (!theme || !availableThemes.includes(theme)) {
    theme = 'minimal'; // Fallback to minimal if config.json fails or theme is invalid
  }
  
  // Create and append the theme link immediately
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `styles/${theme}.css`;
  link.id = 'theme-css';
  document.head.appendChild(link);

  // Preload other themes in the background
  availableThemes.forEach(otherTheme => {
    if (otherTheme !== theme) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.href = `styles/${otherTheme}.css`;
      preloadLink.as = 'style';
      document.head.appendChild(preloadLink);
    }
  });
})();

// Load and apply configuration
async function initializeContent() {
  try {
    const response = await fetch('config.json');
    const config = await response.json();

    // Set page title
    document.title = config.profile.name;

    // Set meta description dynamically
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.profile.tagline || config.profile.bio || '');
    }

    // Set profile information
    document.getElementById('profile-name').textContent = config.profile.name;
    document.getElementById('profile-tagline').textContent = config.profile.tagline;
    document.getElementById('bio-text').textContent = config.profile.bio;


    // Generate social icons
    const socialIcons = document.querySelector('.social-icons');
    const socialIconMap = {
      bluesky: `<svg class="social-icon" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2 42.1-31.6 110.3-56 110.3 21.8 0 15.5-8.9 130.5-14.1 149.2-18.2 64.8-84.4 81.4-143.3 71.3C456 322 482.2 380 425.6 438c-107.4 110.2-154.3-27.6-166.3-62.9-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8c-12 35.3-59 173.1-166.3 62.9-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1 10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/></svg>`,
      email: `<svg class="social-icon" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48L48 64zM0 176L0 384c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-208L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>`,
      github: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
      googlescholar: `<svg class="social-icon" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M 343.75868,106.66243 V 79.430205 L 363.52365,63.999997 H 149.63354 L 20.476345,176.2736 h 85.656075 c -0.15534,2.12494 -0.21914,4.04644 -0.21914,6.22563 0,20.84472 7.2192,38.08662 21.67203,51.86089 14.45284,13.79702 32.25124,20.64784 53.32651,20.64784 4.92319,0 9.75059,-0.36794 14.43842,-1.02419 -2.90722,6.50082 -4.37457,12.52302 -4.37457,18.14228 0,9.87526 4.49924,20.4304 13.46715,31.6418 -39.23377,2.6705 -68.06112,9.73264 -86.43702,21.16322 -10.53108,6.49907 -19.000207,14.70396 -25.390349,24.5311 -6.390569,9.89933 -9.577754,20.51525 -9.577754,31.9616 0,9.64822 2.062375,18.33611 6.21907,26.06233 4.156694,7.7263 9.577757,14.07047 16.312223,18.98408 6.71825,4.96781 14.46899,9.10088 23.219,12.46874 8.73429,3.34378 17.40643,5.71858 26.06106,7.06258 8.62707,1.34222 17.20471,1.9985 25.70579,1.9985 13.46887,0 26.95353,-1.73428 40.54711,-5.18707 13.56165,-3.48461 26.28022,-8.64143 38.17105,-15.4927 11.85935,-6.80488 21.51545,-16.0865 28.9219,-27.7183 7.39024,-11.67998 11.09457,-24.80499 11.09457,-39.33613 0,-11.01584 -2.24964,-21.03852 -6.7502,-30.14073 -4.46864,-9.07202 -9.93785,-16.54102 -16.45271,-22.34403 -6.5008,-5.81263 -12.99987,-11.15539 -19.51512,-15.9679 -6.50083,-4.84488 -12.00021,-9.75058 -16.46884,-14.8129 -4.4848,-5.04657 -6.73444,-10.05419 -6.73444,-14.98395 0,-4.92145 1.73422,-9.67183 5.21588,-14.26559 3.45451,-4.6095 7.67376,-9.04795 12.60967,-13.30571 4.93756,-4.24944 9.87523,-8.96788 14.79665,-14.13302 4.92147,-5.14719 9.14072,-11.82739 12.60971,-20.00822 3.48467,-8.17907 5.20318,-17.44489 5.20318,-27.75679 0,-13.4527 -2.54714,-24.46065 -7.54735,-33.31348 -0.59369,-1.02243 -1.21757,-1.80338 -1.87511,-3.02225 l 56.90745,-46.672136 v 17.118526 c -7.39373,0.92969 -6.62422,5.34582 -6.62422,10.6352 v 128.66719 c 0,5.95832 4.8751,10.83382 10.83386,10.83382 h 3.98869 c 5.95835,0 10.83386,-4.87506 10.83386,-10.83382 V 117.29282 c 0,-5.27669 0.77741,-9.68801 -6.56167,-10.63039 z M 236.39865,329.14114 c 1.14099,0.7503 3.7039,2.78075 7.7184,6.03838 4.0495,3.24319 6.797,5.69582 8.26567,7.41432 1.43851,1.66381 3.5792,4.16501 6.37617,7.54734 2.81268,3.3744 4.7184,6.30394 5.71853,8.73425 1.00016,2.4767 2.01603,5.46089 3.04636,8.94556 0.98567,3.44488 1.48486,6.97595 1.48486,10.56169 0,17.04813 -6.56338,29.68007 -19.65604,37.85915 -13.125,8.18083 -28.76651,12.27368 -46.93767,12.27368 -9.18709,0 -18.2031,-1.09289 -27.06247,-3.1951 -8.84322,-2.11665 -17.31192,-5.3362 -25.39035,-9.60185 -8.07846,-4.25771 -14.57754,-10.20337 -19.50072,-17.79659 -4.93764,-7.64012 -7.40645,-16.41464 -7.40645,-26.24962 0,-10.32022 2.79692,-19.28987 8.42233,-26.90588 5.59343,-7.62564 12.93774,-13.3919 22.03208,-17.3154 9.0624,-3.94582 18.24946,-6.74232 27.56166,-8.39827 9.31221,-1.7023 18.79679,-2.555 28.43842,-2.555 4.46862,0 7.93582,0.25115 10.40465,0.69607 0.45456,0.21918 3.03188,2.07025 7.73456,5.56326 4.70401,3.46237 7.62565,5.59519 8.75047,6.38401 z m -3.35823,-100.5779 c -7.40648,8.85938 -17.73454,13.2882 -30.95363,13.2882 -11.85933,0 -22.29766,-4.76482 -31.26554,-14.31195 -8.99984,-9.52309 -15.42235,-20.32803 -19.34408,-32.43061 -3.93752,-12.10871 -5.90585,-23.98423 -5.90585,-35.648 0,-13.6942 3.59542,-25.35184 10.7809,-34.97598 7.18727,-9.64952 17.49915,-14.48477 30.93786,-14.48477 11.87507,0 22.37423,5.03825 31.43704,15.15677 9.09434,10.08482 15.60961,21.41303 19.5169,33.96799 3.92176,12.5392 5.87345,24.52979 5.87345,35.98399 0,13.44658 -3.70256,24.60984 -11.07663,33.45436 z"/></svg>`,
      linkedin: `<svg class="social-icon" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>`,
      orcid: `<svg class="social-icon" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" focusable="false"><path d="M294.8 188.2h-45.9V342h47.5c67.6 0 83.1-51.3 83.1-76.9 0-41.6-26.5-76.9-84.7-76.9zM256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-80.8 360.8h-29.8v-207.5h29.8zm-14.9-231.1a19.6 19.6 0 1 1 19.6-19.6 19.6 19.6 0 0 1 -19.6 19.6zM300 369h-81V161.3h80.6c76.7 0 110.4 54.8 110.4 103.9C410 318.4 368.4 369 300 369z"/></svg>`,
      default: `<svg class="social-icon" viewBox="0 0 640 512" fill="currentColor" aria-hidden="true" focusable="false"></path></<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>`
    };

    Object.entries(config.social).forEach(([platform, url]) => {
      if (url) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.ariaLabel = `Visit ${platform} profile`;
        a.innerHTML = socialIconMap[platform] || socialIconMap.default;
        socialIcons.appendChild(a);
      }
    });

    // Generate link buttons, but skip the Contact Me link if it matches config.contact.url
    const linksGrid = document.querySelector('.links-grid');
    config.links.forEach(link => {
      // Skip if this link is the contact link
      if (config.contact && link.url === config.contact.url) return;
      const a = document.createElement('a');
      a.href = link.url;
      a.className = 'link-button';
      a.textContent = link.title;
      a.ariaLabel = `Visit ${link.title}`;
      linksGrid.appendChild(a);
    });

    // Set contact button (footer) using config.contact only
    const contactBtn = document.getElementById('contact-button');
    if (config.contact && config.contact.url && config.contact.buttonText) {
      contactBtn.href = config.contact.url;
      contactBtn.textContent = config.contact.buttonText;
      contactBtn.ariaLabel = config.contact.buttonText;
      contactBtn.style.display = '';
    } else {
      contactBtn.style.display = 'none';
    }

    // Load blog post
    if (config.blog.rssFeed) {
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(config.blog.rssFeed)}`)
        .then(response => response.json())
        .then(data => {
          const post = data.items[0];
          document.querySelector('.post-content').innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description.split(' ').slice(0, config.blog.wordCount).join(' ')}...</p>
            <a href="${post.link}" class="read-more" aria-label="Read more about ${post.title}">Read More →</a>
          `;
        })
        .catch(error => {
          console.error('Error fetching blog post:', error);
          document.querySelector('.post-content').innerHTML = `
            <p>Visit my blog at <a href="${config.blog.rssFeed.split('/feed')[0]}" aria-label="Visit Marco Almeida's blog">blog.wonderm00n.com</a></p>
          `;
        });
    } else {
      console.error('Blog RSS feed not provided in config.json');
      document.querySelector('.blog-section').remove();
    }

  } catch (error) {
    console.error('Error loading configuration:', error);
  }
}

// Initialize the page
initializeContent();