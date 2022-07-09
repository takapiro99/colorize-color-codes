// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function setPageBackgroundColor() {
  function htmlToElement(html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
  }
  function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  }

  console.log("colorize start");
  let count = 0;
  const common = "padding:4px;border-radius:3px;border:1px solid grey";
  findAndReplaceDOMText(document.body, {
    find: /#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})/g,
    replace: function (portion, match) {
      count++;
      const text = `<span style="background:${
        portion.text
      };color:${getContrastYIQ(portion.text)};${common}"> ${
        portion.text
      }</span>`;
      return htmlToElement(text);
    },
  });
  console.log(`colorized ${count} colors.`);
}
