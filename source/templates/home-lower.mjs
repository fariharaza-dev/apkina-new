const lowerAsset = name => `/assets/home/${name}`;

export function homeSupport() {
  return `<section class="home-support home-lower-container" id="home-support" aria-labelledby="home-support-title">
    <h2 class="home-lower-heading home-support-heading" id="home-support-title">Flexible Support,<br><span>Based in Pakistan</span></h2>
    <div class="home-support-grid">
      <a class="home-support-card home-support-card-link" href="tel:+923113024005" aria-label="Call Apkina at +92 311 3024005">
        <img class="home-support-icon" src="${lowerAsset('phone.svg')}" alt="" width="40" height="40" loading="lazy">
        <h3>Call us</h3>
        <div class="home-support-details"><p>You can get in touch with our team via phone call.</p><p>Monday to Friday (9 AM to 10 PM)</p></div>
      </a>
      <a class="home-support-card home-support-card-link" href="https://wa.me/923113024005" target="_blank" rel="noopener noreferrer" aria-label="Chat with Apkina on WhatsApp at +92 311 3024005 (opens in a new tab)">
        <img class="home-support-icon" src="${lowerAsset('whatsapp.svg')}" alt="" width="40" height="40" loading="lazy">
        <h3>WhatsApp</h3>
        <div class="home-support-details"><p>You can get in touch with our team via WhatsApp text or call.</p><p>Monday to Friday (9 AM to 10 PM)</p></div>
      </a>
      <a class="home-support-card home-support-card-link" href="mailto:hello@apkina.pk" aria-label="Email Apkina support at hello@apkina.pk">
        <img class="home-support-icon home-support-icon-email" src="${lowerAsset('email.svg')}" alt="" width="50" height="40" loading="lazy">
        <h3>Email Support</h3>
        <div class="home-support-details"><p>You can get in touch with our team via email support center.</p><p>hello@apkina.pk</p></div>
      </a>
    </div>
  </section>`;
}

export function homeNews() {
  const stories = [
    {slug:'colour-temperature', image:'news-1-3x.webp', title:'Understanding color temperature for your next creative setup'},
    {slug:'rgb-lighting', image:'news-2-3x.webp', title:'Create a different atmosphere with RGB lighting'},
    {slug:'portable-lighting', image:'news-3-3x.webp', title:'Build a compact lighting setup that goes with you.'}
  ];
  return `<section class="home-news home-lower-container" aria-labelledby="home-news-title">
    <h2 class="home-lower-heading" id="home-news-title">Latest News</h2>
    <div class="home-news-grid">${stories.map(story => `<article class="home-news-card"><a href="/explore/${story.slug}/"><div class="home-news-image"><img src="${lowerAsset(story.image)}" alt="" width="424" height="424" loading="lazy" decoding="async"></div><h3>${story.title}</h3></a></article>`).join('')}</div>
  </section>`;
}

export function homeFooter() {
  const groups = [
    {title:'Products', items:[['RGB Tube Lights','/products/?category=rgb-tube-lights'],['LED Panels','/products/?category=led-panels'],['Studio Lights','/products/?category=studio-lights'],['Tripods','/products/?category=tripods'],['Power & Chargers','/products/?category=power-chargers']]},
    {title:'Solutions', items:[['Studio Lighting','/solutions/#studio'],['Portable Lighting','/solutions/#portable'],['Creative Colour','/solutions/#creative'],['Camera Support','/solutions/#support']]},
    {title:'Contact', items:[['Call us','tel:+923113024005'],['WhatsApp','https://wa.me/923113024005'],['Email','mailto:hello@apkina.pk']]},
    {title:'Legal', items:[['Terms & Conditions'],['Privacy Policy','/privacy/'],['Cookie Usage']]},
    {title:'Social Media', items:[['Instagram'],['TikTok'],['Facebook'],['Linkedin']]}
  ];
  return `<footer class="home-footer" aria-label="Apkina footer">
    <div class="home-footer-inner">
      <div class="home-footer-header">
        <div class="home-footer-brand"><a href="/" aria-label="Apkina home"><img src="${lowerAsset('footer-logo.svg')}" alt="Apkina" width="335" height="60" loading="lazy"></a><p>For Pakistani Creators</p></div>
        <div class="home-footer-country"><img src="${lowerAsset('pakistan-flag.svg')}" alt="" width="35" height="25" loading="lazy"><span>Proud Pakistani Brand</span></div>
      </div>
      <div class="home-footer-columns">${groups.map(group => `<section class="home-footer-column"><h2>${group.title}</h2><ul>${group.items.map(([label,url]) => `<li>${url ? `<a href="${url.replaceAll('&','&amp;')}">${label.replaceAll('&','&amp;')}</a>` : `<span>${label.replaceAll('&','&amp;')}</span>`}</li>`).join('')}</ul></section>`).join('')}</div>
    </div>
    <img class="home-footer-wordmark" src="${lowerAsset('footer-wordmark.svg')}" alt="" width="1440" height="273" loading="lazy" aria-hidden="true">
  </footer>`;
}
