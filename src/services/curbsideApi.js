import axios from "axios";

export const fetchCurbsideData = async () => {
  const response = await axios.get("https://api.allorigins.win/get", {
    params: { url: "https://www.curbsideoakland.com/menu-1" }
  });
  const el = document.createElement("html");
  el.innerHTML = response.data.contents;
  const scoopsElement = Array.from(el.getElementsByTagName("h2")).find(e => e.textContent === "Scoops");
  if (scoopsElement && scoopsElement.nextSibling) {
    return Array.from(scoopsElement.nextSibling.children).map(e => e.children[0].textContent);
  }
  return [];
}; 