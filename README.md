Rapid JS
========

![rapid.js](http://glassocean.net/media/rapidjs.jpg)

Write Once, Run Anywhere. Rapid prototyping and live in-page editing without leaving the browser.

The barrier to entry is very low here, no setting up Node, no toolchain rituals. Nothing too complicated at all.

Just include all three files in your HTML:

```
<head>
  <link rel="stylesheet" type="text/css" href="rapidjs/style.css">
</head>

<body>
  (...)
  <script type="text/javascript" src="rapidjs/rapid.js"></script>
  <script type="text/javascript" src="rapidjs/customelements.js"></script>
</body>
```

And then you can start using Rapid Components by tagging elements in your HTML with the appropriate data-\* attribute, and any additional parameters:

```
<div data-rapid-expander="SPOILER ALERT!!!">
```

```
<table data-rapid-cellcalc></table>
```

The HTML elements are up-converted to a fully functional component on page load. You can also develop your own Rapid Components very easily. Components currently included:

*Expander, Table of Contents, Protocol, Syntax, Grid, Option, Image, Embed, Nav, Block, Cell Calc, Dirlist*

Demo site:

http://glassocean.net/lab/rapidjs/index.html
