// 🚀 Domain Auto-Redirect Failsafe
(function() {
  const correctDomain = "writeupportalos.netlify.app";
  const currentDomain = window.location.hostname;
  const incorrectDomain = "writeupportalosss.netlify.app";

  // If user lands on the specific wrong domain, redirect instantly
  if (currentDomain === incorrectDomain) {
    const newUrl = window.location.href
      .replace(incorrectDomain, correctDomain)
      .replace(/#+/g, "#"); // Fix any multiple hash artifacts like ## or ###
    console.warn("⚠️ Wrong domain detected, redirecting to:", newUrl);
    window.location.replace(newUrl);
  }
})();


