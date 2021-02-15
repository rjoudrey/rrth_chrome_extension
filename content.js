function markKnownCharacters(keywordForChar, element) {
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
            spanNode.className = 'marked';
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

const span_style=`
.marked {
  position: relative;
}

.marked:after {
  content: '';
  position: absolute;
  left: 5%;
  width: 90%;
  display: block;
  height: 1px;
  background-color: #89CFF0;
}
`;

function addStyles() {
    var sheet = document.createElement('style')
    sheet.innerHTML = span_style;
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