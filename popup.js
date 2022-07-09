let colorizeButton = document.getElementById("colorize-color-codes");

colorizeButton.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: colorizeColorCodes,
  });
});

function colorizeColorCodes() {
  // https://github.com/padolsey/findAndReplaceDOMText/pull/59
  function htmlToElement(html) {
    var template = document.createElement("template");
    template.innerHTML = html;
    return template.content.firstChild;
  }
  // https://stackoverflow.com/a/11868398/13126073
  function getContrastYIQ(hexcolor) {
    hexcolor = hexcolor.replace("#", "");
    var r = parseInt(hexcolor.substr(0, 2), 16);
    var g = parseInt(hexcolor.substr(2, 2), 16);
    var b = parseInt(hexcolor.substr(4, 2), 16);
    var yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  }

  let count = 0;
  console.log("colorize start");
  const common = "padding:4px;border-radius:3px;border:1px solid grey";
  // https://github.com/padolsey/findAndReplaceDOMText
  findAndReplaceDOMText(document.body, {
    find: /#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})/g,
    replace: function (portion) {
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
