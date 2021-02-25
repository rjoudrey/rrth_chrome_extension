function markKnownCharacters(keywordForChar, element) {
    if (element.nodeName.toLowerCase() === 'span' && 
        element.classList.contains('marked_known_class')) {
        return; // skip nodes we created.
    }

    for (var child = element.firstChild; child !== null; child = child.nextSibling) {
        if (child.nodeType === 3) { // text node
            // Get the first known character in the node.
            var text = child.data;
            var keyword = undefined;
            var firstKnownIndex = null;
            for (var i = 0; i < text.length; i++) {
                var char = text[i];
                keyword = keywordForChar[char];
                if (keyword !== undefined) {
                    firstKnownIndex = i;
                    break;
                }
            }
            if (keyword === undefined) {
                continue;
            }
            // Split the current node if needed.
            var knownCharacterNode = child.splitText(firstKnownIndex);
            // Split the suffix if needed.
            if (i != text.length - 1) {
               knownCharacterNode.splitText(1);
            }

            // Create a span node to replace the current node.
            var spanNode = document.createElement('span');
            // Show an underline under the character.
            spanNode.className = 'marked_known_class';
            // Show the associated RRTH keyword when you hover over the character.
            spanNode.setAttribute("title", keyword);

            // Clone the current node that contains the known character, and put it into the span node.
            var knownCharacterNodeClone = knownCharacterNode.cloneNode(true);
            spanNode.appendChild(knownCharacterNodeClone);

            // Replace the known character node with the created span node.
            knownCharacterNode.replaceWith(spanNode);

            // Skip over the node we created
            child = spanNode;
        } else if (child.nodeType === 1) {
            markKnownCharacters(keywordForChar, child);
        }
    }
}

function addStyles() {
    const spanStyle=`
    .marked_known_class {
      position: relative;
    }

    .marked_known_class:after {
      content: '';
      position: absolute;
      left: 5%;
      width: 90%;
      display: block;
      height: 1px;
      background-color: #89CFF0;
    }
    `;
    if (document.getElementById('marked_known_style')) {
        return;
    }
    var sheet = document.createElement('style');
    sheet.id = "marked_known_style";
    sheet.innerHTML = spanStyle;
    document.body.appendChild(sheet);
}

async function loadKnownCharacterMap() {
    const url = chrome.runtime.getURL('known_list.txt');
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split(/\r?\n/);
    var map = {};
    for (var line of lines) {
        var char = line.charAt(0);
        var keyword = line.substring(2);
        map[char] = keyword;
    }
    return map;
}

loadKnownCharacterMap().then((keywordForChar) => {
    addStyles();
    markKnownCharacters(keywordForChar, document.body);
});