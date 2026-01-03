const express = require("express");
const { parseDocument } = require("htmlparser2");

const app = express();

/* ---------------- HTML → TREE (Node.js) ---------------- */

function parseHTMLToTree(html) {
  const document = parseDocument(html);
  return domToTree(document);
}

function domToTree(node) {
  // Text node
  if (node.type === "text") {
    const text = node.data.trim();
    if (!text) return null;

    return {
      type: "text",
      value: text,
      children: []
    };
  }

  // Root / element node
  const treeNode = {
    type: node.name || "root",
    attrs: node.attribs || {},
    value: null,
    children: []
  };

  if (node.children) {
    for (const child of node.children) {
      const childNode = domToTree(child);
      if (childNode) treeNode.children.push(childNode);
    }
  }

  return treeNode;
}

/* ---------------- DEMO HTML ---------------- */

const html = `
<div id="app">
  <h1>Hello</h1>
  <p>World <span style="color:red">!</span></p>
</div>
<div>Another div</div>
`;

/* ---------------- SERVER ---------------- */

app.get("/", (req, res) => {
  const tree = parseHTMLToTree(html);

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>HTML Tree Renderer</title>
</head>
<body>
  <h3>Rendered DOM:</h3>
  <div id="mount"></div>

  <script>
    // Tree injected from Node
    const tree = ${JSON.stringify(tree)};

    function treeToDOM(node) {
      // Text node
      if (node.type === "text") {
        return document.createTextNode(node.value);
      }

      // Element node
      const el = document.createElement(node.type);

      // Attributes
      if (node.attrs) {
        for (const key in node.attrs) {
          el.setAttribute(key, node.attrs[key]);
        }
      }

      // Children
      for (const child of node.children) {
        el.appendChild(treeToDOM(child));
      }

      return el;
    }

    const mount = document.getElementById("mount");

    // Skip root wrapper
    tree.children.forEach(child => {
      mount.appendChild(treeToDOM(child));
    });
  </script>
</body>
</html>
  `);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
