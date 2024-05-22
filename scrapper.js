const NUM_OF_PAGES = 2;
const WAIT_BEFORE_EACH_PAGE = 6000;
const jsonToCsv = (jsonData) => {
  if (jsonData.length === 0) {
    return ''; // Return an empty string if jsonData is empty
  }
  
  const keys = Object.keys(jsonData[0]);
  const csvRows = [];
  csvRows.push(keys.join(","));
  for (const row of jsonData) {
    const values = keys.map((k) => JSON.stringify(row[k]));
       csvRows.push(values.join(","));
  }
  return csvRows.join("\n");
};
const downloadCsv = (csv) => {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = "data.csv";
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a); // Clean up after download
};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const goToNextPage = () => {
  const nextButton = document.querySelector("#pnnext");
  if (nextButton) {
    nextButton.click();
  }
};
const runScraper = async () => {
  let data = [];
  for (let page = 1; page <= NUM_OF_PAGES; page++) {
    console.log(`Fetching page ${page}...`);
    const listings = document.querySelectorAll(".VkpGBb");
    for (const listing of listings) {
      const divs = listing.querySelectorAll(".rllt__details div");
      const title = listing.querySelector(".dbg0pd")?.textContent || '';
      const rating = listing.querySelector(".yi40Hd")?.textContent || '';
      let address_line = divs?.[2]?.textContent || '';
      if (address_line.includes("years in business · ")) {
        address_line = address_line.split("years in business · ").pop();
      }
      let phone_line = divs?.[3]?.textContent || '';
      if (phone_line?.split("·")?.length > 1) {
        phone_line = phone_line.split(" · ").pop();
           }
      listing.querySelector("a").click();
      await delay(3000);
      const website_url = document.querySelector(".mI8Pwc")?.href || '';
      data.push({
        title,
        rating,
        address_line,
        phone_line,
        website_url,
      });
    }
    if (page < NUM_OF_PAGES) {
      goToNextPage();
      await delay(WAIT_BEFORE_EACH_PAGE);
    }
  }
  return data;
};
runScraper()
  .then((listings) => {
    console.log(
      `Scraping Completed! ${listings.length} results found. Downloading CSV...`
    );
    const csv = jsonToCsv(listings);
    downloadCsv(csv);
  })
  .catch((err) => console.log("Error scraping the results: ", err));
