// Theme selection and dynamic loading
(async function() {
  const availableThemes = ['bulky', 'kubrik', 'bright', 'dark', 'minimal', 'dark-mint', 'vibrant'];
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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('config.json');
    const config = await response.json();
    const profileImage = document.getElementById('gravatar-image');
    if (config.profile && config.profile.gravatarEmail) {
      const cleanEmail = config.profile.gravatarEmail.trim().toLowerCase();
      const gravatarHash = CryptoJS.SHA256(cleanEmail);
      profileImage.src = `https://www.gravatar.com/avatar/${gravatarHash}?size=2048`;
      if (config.gravatarHovercard) {
        profileImage.classList.add('hovercard');
        if (window.Gravatar && typeof Gravatar.init === 'function') {
          Gravatar.init();
        }
      } else {
        profileImage.classList.remove('hovercard');
      }
    }
  } catch (error) {
    console.error('Error setting Gravatar image:', error);
  }
});

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
      bluesky: `<svg xmlns="http://www.w3.org/2000/svg" class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M111.8 62.2C170.2 105.9 233 194.7 256 242.4c23-47.6 85.8-136.4 144.2-180.2 42.1-31.6 110.3-56 110.3 21.8 0 15.5-8.9 130.5-14.1 149.2-18.2 64.8-84.4 81.4-143.3 71.3C456 322 482.2 380 425.6 438c-107.4 110.2-154.3-27.6-166.3-62.9-1.7-4.9-2.6-7.8-3.3-7.8s-1.6 3-3.3 7.8c-12 35.3-59 173.1-166.3 62.9-56.5-58-30.4-116 72.5-133.5C100 314.6 33.8 298 15.7 233.1 10.4 214.4 1.5 99.4 1.5 83.9c0-77.8 68.2-53.4 110.3-21.8z"/></svg>`,
      email: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>`,
      github: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
      googlescholar: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M390.9 298.5s0 .1.1.1c9.2 19.4 14.4 41.1 14.4 64C405.3 445.1 338.5 512 256 512s-149.3-66.9-149.3-149.3c0-22.9 5.2-44.6 14.4-64 1.7-3.6 3.6-7.2 5.6-10.7 4.4-7.6 9.4-14.7 15-21.3 27.4-32.6 68.5-53.3 114.4-53.3 33.6 0 64.6 11.1 89.6 29.9 9.1 6.9 17.4 14.7 24.8 23.5 5.6 6.6 10.6 13.8 15 21.3 2 3.4 3.8 7 5.5 10.5zm26.4-18.8c-30.1-58.4-91-98.4-161.3-98.4s-131.2 40-161.3 98.4L0 202.7 256 0l256 202.7-94.7 77.1z"/></svg>`,
      linkedin: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>`,
      orcid: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M294.8 188.2h-45.9V342h47.5c67.6 0 83.1-51.3 83.1-76.9 0-41.6-26.5-76.9-84.7-76.9zM256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm-80.8 360.8h-29.8v-207.5h29.8zm-14.9-231.1a19.6 19.6 0 1 1 19.6-19.6 19.6 19.6 0 0 1 -19.6 19.6zM300 369h-81V161.3h80.6c76.7 0 110.4 54.8 110.4 103.9C410 318.4 368.4 369 300 369z"/></svg>`,
      default: `<svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M21.2424919,12.4162328c2.0100108-2.0100108,2.0100108-5.265161,0-7.2751718-1.7787706-1.7787706-4.5821127-2.0100108-6.6276989-.5478614l-.0569209.0391329c-.5122857.3664267-.6296852,1.0779351-.2632578,1.5866633s1.0779346.629685,1.5866636.2632581l.0569209-.0391329c1.141971-.814677,2.7037313-.6866053,3.6927274.3059485,1.1206255,1.1206255,1.1206255,2.9349715,0,4.055597l-3.9915617,3.9986756c-1.1206255,1.1206255-2.9349715,1.1206255-4.055597,0-.9925538-.9925538-1.1206255-2.5543142-.3059488-3.6927279l.0391332-.0569209c.3664263-.5122857.2454701-1.2237945-.2632578-1.5866631s-1.223794-.2454701-1.5866636.2632578l-.0391332.0569209c-1.4657063,2.042029-1.2344662,4.8453716.5443045,6.6241422,2.0100108,2.0100108,5.265161,2.0100108,7.2751718,0l3.9951184-3.9951184ZM2.7575081,11.5837678c-2.0100108,2.0100103-2.0100108,5.2651605,0,7.2751713,1.7787705,1.7787706,4.5821131,2.0100108,6.6276993.5478611l.0569209-.0391332c.5122857-.3664263.6296852-1.0779346.2632578-1.5866636s-1.0779351-.6296852-1.5866636-.2632578l-.0569209.0391332c-1.141971.8146767-2.7037313.686605-3.6927279-.3059488-1.1206249-1.1241822-1.1206249-2.9385282.0000005-4.0591537l3.9915612-3.9951189c1.1206255-1.1206255,2.9349721-1.1206255,4.0555976,0,.9925538.9925538,1.1206255,2.5543147.3059488,3.6962857l-.0391332.0569209c-.3664263.5122857-.2454701,1.223794.2632578,1.5866636s1.223794.2454701,1.5866636-.2632578l.0391332-.0569209c1.4657063-2.0455873,1.2344662-4.8489294-.5443045-6.6277-2.0100108-2.0100108-5.265161-2.0100108-7.2751718,0l-3.9951188,3.9951189Z"></path></svg>`
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