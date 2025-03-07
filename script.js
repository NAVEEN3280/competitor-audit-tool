async function fetchSEOData(url) {
  try {
    let response = await fetch(
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    );
    let data = await response.json();
    let parser = new DOMParser();
    let doc = parser.parseFromString(data.contents, "text/html");

    return {
      title: doc.querySelector("title")?.innerText || "No Title",
      description:
        doc.querySelector("meta[name='description']")?.content ||
        "No Description",
      headings: {
        h1: doc.querySelectorAll("h1").length,
        h2: doc.querySelectorAll("h2").length,
        h3: doc.querySelectorAll("h3").length,
      },
      links: {
        total: doc.querySelectorAll("a").length,
        internal: [...doc.querySelectorAll("a")].filter((link) =>
          link.href.includes(url)
        ).length,
        external: [...doc.querySelectorAll("a")].filter(
          (link) => !link.href.includes(url)
        ).length,
      },
      images: {
        total: doc.querySelectorAll("img").length,
        missingAlt: [...doc.querySelectorAll("img")].filter((img) => !img.alt)
          .length,
      },
    };
  } catch (error) {
    return null;
  }
}

async function analyzeCompetitors() {
  let yourWebsite = document.getElementById("yourWebsite").value.trim();
  let competitorWebsite = document
    .getElementById("competitorWebsite")
    .value.trim();
  let loading = document.getElementById("loading");
  let resultDiv = document.getElementById("comparisonResults");
  let reportDiv = document.getElementById("report");

  if (!yourWebsite || !competitorWebsite) {
    alert("Please enter both URLs.");
    return;
  }

  // Show loading animation & clear previous results
  loading.classList.remove("hidden");
  reportDiv.classList.add("hidden");
  resultDiv.innerHTML = "";

  let yourData = await fetchSEOData(yourWebsite);
  let competitorData = await fetchSEOData(competitorWebsite);

  if (!yourData || !competitorData) {
    resultDiv.innerHTML = "Failed to fetch data. Please try again.";
    loading.classList.add("hidden");
    return;
  }

  // Generating feedback suggestions based on the comparison
  function generateFeedback(yourValue, competitorValue, metric) {
    if (yourValue > competitorValue) {
      return `<p class="positive">✅ Your ${metric} is better than your competitor. Keep up the good work!</p>`;
    } else if (yourValue < competitorValue) {
      return `<p class="negative">⚠️ Your competitor has a better ${metric}. Consider improving it.</p>`;
    } else {
      return `<p class="neutral">ℹ️ Your ${metric} is similar to your competitor.</p>`;
    }
  }

  let comparisonHTML = `
      <h3>Title & Meta Description</h3>
      <p><strong>Your Title:</strong> ${yourData.title}</p>
      <p><strong>Competitor Title:</strong> ${competitorData.title}</p>
      ${generateFeedback(
        yourData.title.length,
        competitorData.title.length,
        "Title Length"
      )}

      <p><strong>Your Description:</strong> ${yourData.description}</p>
      <p><strong>Competitor Description:</strong> ${
        competitorData.description
      }</p>
      ${generateFeedback(
        yourData.description.length,
        competitorData.description.length,
        "Meta Description Length"
      )}

      <h3>Headings</h3>
      <p><strong>Your H1 Tags:</strong> ${yourData.headings.h1}</p>
      <p><strong>Competitor H1 Tags:</strong> ${competitorData.headings.h1}</p>
      ${generateFeedback(
        yourData.headings.h1,
        competitorData.headings.h1,
        "H1 Tags"
      )}

      <p><strong>Your H2 Tags:</strong> ${yourData.headings.h2}</p>
      <p><strong>Competitor H2 Tags:</strong> ${competitorData.headings.h2}</p>
      ${generateFeedback(
        yourData.headings.h2,
        competitorData.headings.h2,
        "H2 Tags"
      )}

      <h3>Links</h3>
      <p><strong>Your Total Links:</strong> ${yourData.links.total}</p>
      <p><strong>Competitor Total Links:</strong> ${
        competitorData.links.total
      }</p>
      ${generateFeedback(
        yourData.links.total,
        competitorData.links.total,
        "Total Links"
      )}

      <p><strong>Your Internal Links:</strong> ${yourData.links.internal}</p>
      <p><strong>Competitor Internal Links:</strong> ${
        competitorData.links.internal
      }</p>
      ${generateFeedback(
        yourData.links.internal,
        competitorData.links.internal,
        "Internal Links"
      )}

      <p><strong>Your External Links:</strong> ${yourData.links.external}</p>
      <p><strong>Competitor External Links:</strong> ${
        competitorData.links.external
      }</p>
      ${generateFeedback(
        yourData.links.external,
        competitorData.links.external,
        "External Links"
      )}

      <h3>Images</h3>
      <p><strong>Your Total Images:</strong> ${yourData.images.total}</p>
      <p><strong>Competitor Total Images:</strong> ${
        competitorData.images.total
      }</p>
      ${generateFeedback(
        yourData.images.total,
        competitorData.images.total,
        "Total Images"
      )}

      <p><strong>Your Missing Alt Attributes:</strong> ${
        yourData.images.missingAlt
      }</p>
      <p><strong>Competitor Missing Alt Attributes:</strong> ${
        competitorData.images.missingAlt
      }</p>
      ${generateFeedback(
        yourData.images.missingAlt,
        competitorData.images.missingAlt,
        "Images Missing Alt Text"
      )}
  `;

  resultDiv.innerHTML = comparisonHTML;

  // Hide loading animation and show results
  loading.classList.add("hidden");
  reportDiv.classList.remove("hidden");
}
