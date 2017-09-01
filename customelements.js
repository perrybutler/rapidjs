/*
	EXPANDER
*/

RAPID.element({
	name: "expander",
	state: {
		title: "",
		expanded: false,
	},
	init: function() {
		//console.log("init", this);
		var domContainer = this.dom["container"];
		//addClass(domContainer, "rapid-expander");

		// copy the original nodes inside the pseudo-expander
		var originalnodes = [];
		for (var ii = 0; ii < domContainer.childNodes.length; ii++) {
			originalnodes.push(domContainer.childNodes[ii]);
		}

		// create the expander preview/body and move the original nodes into the body
		if (originalnodes.length > 0) {
			var domPreview = this.createElement("div", "preview");
			domPreview.className = "preview";
			domPreview.innerHTML = domContainer.dataset.rapidExpander;
			this.state.title = domContainer.dataset.rapidExpander;
			//console.log(this.state.title);

			var domBody = this.createElement("div");
			domBody.className = "body";

			for (var ii = 0; ii < originalnodes.length; ii++) {
				domBody.appendChild(originalnodes[ii]);
			}

			domPreview.onclick = (function(that) {
				return function() {
					//console.log("onclick ", that.dom["container"].innerText, that.state.expanded);
					if (domContainer.dataset.rapidExpanderSrc) {
						// we need to query the soundcloud api to get the embed code
						var req = new XMLHttpRequest();
						var params = "" //"format=json&url=" + encodeURIComponent(url);
					    req.open("GET", domContainer.dataset.rapidExpanderSrc);
					    req.onreadystatechange = function() {
					    	var statusPassing = "200";
					    	// if working from the filesystem, override statusPassing to "0" since
					    	//	a json file returns req.status == "0" on success
					    	var isReqHttp = false;
					    	if (domContainer.dataset.rapidExpanderSrc && domContainer.dataset.rapidExpanderSrc.includes("http")) {
					    		isReqHttp = true;
					    	}
					    	if (!isReqHttp && window.location.protocol == "file:") {
								statusPassing = "0";
							}
							//if (req.readyState == 4 && req.status == statusPassing) {
							if (req.readyState == 4) {
								var html = req.responseText;
								domBody.innerHTML = html;
							}
					    };
					    req.send(null); 
					}
					if (that.state.expanded) {
						that.state.expanded = false;
					}
					else {
						that.state.expanded = true;
					}
				}
			}(this));
		}
	},
	render: function() {
		//console.log("render", this);
		var domContainer = this.dom["container"];
		if (domContainer) {
			//console.log(this.state);
			if (this.state.expanded) {
				addClass(domContainer, "expanded");
			}
			else {
				removeClass(domContainer, "expanded");
			}
		}

	}
});

/*
	TABLE OF CONTENTS (TOC)
*/

// NEW DESIGN: first add all the h1, then add all the h2 below the proper h1, then add all the 
//	h3 below the proper h1/h2, etc etc

RAPID.element({
	name: "toc",
	state: {
	},
	init: function() {
		var domContainer = this.dom["container"];
		addClass(domContainer, "rapid-toc");

		var ul = document.createElement("UL");
		domContainer.appendChild(ul);

		var depth = domContainer.dataset.rapidTocDepth.split(",");
		var start = parseInt(depth[0]);
		var end = parseInt(depth[1]);
		var sourceElement = document.getElementById(domContainer.dataset.rapidToc);

		//console.log("process toc ", domContainer, sourceElement);

		processTocsRecursive(domContainer, sourceElement, null, start, end);

		// TODO: start at the top level and add all the h1 elements to toc first
		//	then increment level and add all the h2 elements beneath the appropriate h1 elements

		function processTocsRecursive(tocElement, sourceElement, nodes, levelNum, maxLevelNum) {
			//console.log("processTocsRecursive", tocElement, sourceElement, nodes, levelNum, maxLevelNum);
			var level = "h" + levelNum;
			if (!nodes) {
				nodes = sourceElement.getElementsByTagName(level);
			}
			for (var i = 0; i < nodes.length; i++) {
				var h = nodes[i];
				var hText = h.innerText.split(" - ")[0];
				
				// here we determine if the heading comes before/after a parent heading, then use
				// 	insertAfter instead of appendChild below...

				// first query the parent headings using levelNum - 1, then iterate them and find out
				//	where our current h belongs using DOMElement.compareDocumentPosition

				var parentLevelNum = levelNum - 1
				var parentLevel = "h" + parentLevelNum;
				var parentNodes = sourceElement.getElementsByTagName(parentLevel);
				var afterNode = null;
				for (var ii = 0; ii < parentNodes.length; ii++) {
					var parentNode = parentNodes[ii];
					var nextParentNode = parentNodes[ii + 1];
					var pos = parentNode.compareDocumentPosition(h);
					if (pos == 4) {
						afterNode = parentNode;
					}
					//console.log("compare ", h, parentNode, pos);
				}

				var afterNodeText = "";
				if (afterNode) {
					afterNodeText = afterNode.innerText.split(" - ")[0];
				}

				//console.log("after ", h, afterNode);

				var tocNode = document.createElement("li");
				tocNode.innerHTML = "<a href=#" + h.id + ">" + hText + "</a>";
				tocNode.className = "rapid-toc-node level-" + levelNum;
				tocNode.dataset.rapidTocText = hText;

				// var isFirstLevel = false;
				// var ull = ul.getElementsByTagName("ul");
				// console.log("ulll", ull, ul);
				// if (ull.length == 0) {
				// 	isFirstLevel = true;
				// }

				// now get the matching parent li from the toc so we can append a child li
				if (levelNum == start) {
					var tocUl = tocElement.getElementsByTagName("UL")[0];
					tocUl.appendChild(tocNode);
					var nextLevelNum = levelNum + 1;
					var nextLevel = "h" + nextLevelNum;
					var nextNodes = sourceElement.getElementsByTagName(nextLevel);
					//console.log(nextLevel, nextNodes);
				}
				else {
					//console.log("sublevel", levelNum, hText, afterNodeText);
					var parentTocNodes = tocElement.querySelectorAll(".level-" + parentLevelNum);
					//console.log("tocnodes", parentTocNodes);
					for (var ii = 0; ii < parentTocNodes.length; ii++) {
						var li = parentTocNodes[ii];
						var liText = li.dataset.rapidTocText;
						//console.log("tocnode", hText, liText, afterNodeText);
						if (liText == afterNodeText) {
							var tocUl = li.getElementsByTagName("ul")[0];
							//console.log("tocul", tocUl);
							if (!tocUl) {
								tocUl = document.createElement("UL");
								li.appendChild(tocUl);
							}
							tocUl.appendChild(tocNode);
						}
					}
				}
				
			}
			if (nextNodes && nextLevelNum <= maxLevelNum) {
				//console.log("nodes ", nextNodes, nextLevelNum, maxLevelNum);
				processTocsRecursive(tocElement, sourceElement, nextNodes, nextLevelNum, maxLevelNum);
			}
		}
	}
});

/*
	PROTOCOL
*/

RAPID.element({
	name: "protocol",
	state: {
	},
	init: function() {
		var domContainer = this.dom["container"];
		var protocol = domContainer.dataset.rapidProtocol;
		var browserProtocol = window.location.protocol.replace(":", "");
		if (browserProtocol == protocol) {
			domContainer.style.display = "block";
			var html = domContainer.innerHTML;
			html = html.replace("</div>", "</div>")
			html = html.replace("<!--", "").replace("-->", "");
			domContainer.innerHTML = html;
		}
		else {
			domContainer.style.display = "none";
		}
		//delete el.dataset.rapidProtocol;
	}
});

/*
	SYNTAX
*/

RAPID.element({
	name: "syntax",
	state: {
	},
	init: function() {
		var domContainer = this.dom["container"];
		var html = domContainer.innerHTML;
		var div = document.createElement("DIV");
		var pre = document.createElement("PRE");
		var code = document.createElement("CODE");

		div.className = "rapid-syntax";

		div.appendChild(pre);
		pre.appendChild(code);

		//html = html.replaceAll("<", "&lt").replace(">", "&gt");

		// snippet: http://idiallo.com/blog/javascript-syntax-highlighter
		var strReg1 = /"(.*?)"/g;
	    var strReg2 = /'(.*?)'/g;
	    var specialReg = /\b(new|var|if|do|function|while|switch|for|foreach|in|continue|break)(?=[^\w])/g;
	    var specialJsGlobReg = /\b(document|window|Array|String|Object|Number|\$)(?=[^\w])/g;
	    var specialJsReg = /\b(getElementsBy(TagName|ClassName|Name)|getElementById|querySelectorAll|createElement|appendChild|onload|typeof|instanceof)(?=[^\w])/g;
	    var specialMethReg = /\b(indexOf|match|replace|toString|length)(?=[^\w])/g;
	    var specialPhpReg  = /\b(define|echo|print_r|var_dump)(?=[^\w])/g;
	    var specialCommentReg  = /(\/\*.*\*\/)/g;
	    var inlineCommentReg = /(\/\/.*)/g;
		var htmlTagReg = /(&lt;[^\&]*&gt;)/g;

		//console.log(inlineCommentReg.exec(html));

		var parsed = html;

		var match = inlineCommentReg.exec(parsed);
		while (match != null) {
			var c = match[0];
			var cc = c.replace("function", "func<span></span>tion");
			cc = cc.replace("document", "docu<span></span>ment");
			parsed = parsed.replace(c, cc);
			match = inlineCommentReg.exec(parsed);
		}

		parsed = parsed.replace(strReg1,'<span class="string">"$1"</span>');
	    parsed = parsed.replace(strReg2,"<span class=\"string\">'$1'</span>");
	    parsed = parsed.replace(specialReg,'<span class="special">$1</span>');
	    parsed = parsed.replace(specialJsGlobReg,'<span class="special-js-glob">$1</span>');
	    parsed = parsed.replace(specialJsReg,'<span class="special-js">$1</span>');
	    parsed = parsed.replace(specialMethReg,'<span class="special-js-meth">$1</span>');
	    parsed = parsed.replace(htmlTagReg,'<span class="special-html">$1</span>');
	    parsed = parsed.replace(specialPhpReg,'<span class="special-php">$1</span>');
	    parsed = parsed.replace(specialCommentReg,'<span class="special-comment">$1</span>');
	    parsed = parsed.replace(inlineCommentReg,'<span class="special-comment">$1</span>');

		code.innerHTML = parsed;

		//document.body.appendChild(div);
		insertAfter(div, domContainer);
		domContainer.remove();
		this.dom["container"] = div;
	}
});

/*
	GRID
*/

RAPID.element({
	name: "grid",
	init: function() {
		var domContainer = this.dom["container"];
		console.log("domcontainer", domContainer);
		var margin = 2;
		var spl = domContainer.dataset.rapidGrid.split(",");
		var cellCount = spl[0];
		var cellSpan = spl[1];
		var cellSpacing = margin * (cellCount - 1);
		//domContainer.dataset.rapidGrid = "";
		//delete domContainer.dataset.rapidGrid;
		domContainer.style.marginRight = margin + "%";
		domContainer.style.display = "inline-block";
		domContainer.style.float = "left";
		domContainer.style.width = (100 - cellSpacing) / cellCount * cellSpan + "%";
		domContainer.className = "rapid-grid-cell";
		var nextSibling = domContainer.nextElementSibling;
		var isLast = true;
		if (nextSibling) {
			if (nextSibling.dataset) {
				if (nextSibling.dataset.rapidGrid) {
					isLast = false;
				}
			}
			if (nextSibling.className.includes("rapid-grid-cell")) {
				isLast = false;
			}
		}
		if (isLast == true) {
			domContainer.className += " last";
			var el2 = document.createElement("DIV");
			el2.style.clear = "both";
			//domContainer.insertAfter(el2);
			insertAfter(el2, domContainer);
		}
		//processGrids();
	}
});

/*
	OPTION
*/

// TODO: if we store state in js object, state is lost during a save...instead we need to embed state into
//	the html element and use our code as an interface to that data...or we need to export the state as an object
//	and embed it in the DOM element's data attribute on save, then pull it back into JavaScript when the html
//  file is loaded again

//	or we might look at this as an option, to maintain state or reset the state for each time 
//	the file is opened

RAPID.element({
	name: "option",
	state: {
	},
	init: function() {
		var domContainer = this.dom["container"];
		var table = document.createElement("TABLE");
		var tbody = document.createElement("TBODY");
		var row = document.createElement("TR");
		tbody.appendChild(row);
		table.appendChild(tbody);
		domContainer.appendChild(table);

		var labels = domContainer.dataset.rapidOption.split(",");
		for (var ii = 0; ii < labels.length; ii++) {
			var label = labels[ii];

			var td = document.createElement("TD");
			td.className = "rapid-option-button";
			row.appendChild(td);

			var newlabel = document.createElement("DIV");
			newlabel.innerHTML = label;
			newlabel.className = "rapid-option-button-label";
			if (ii == 0) {
				newlabel.className += " selected";
			}
			td.appendChild(newlabel);

			if (ii < labels.length - 1) {

				var sep = document.createElement("TD");
				sep.className = "rapid-option-sep";
				row.appendChild(sep);

				var line = document.createElement("DIV");
				line.className = "rapid-option-sep-line";
				sep.appendChild(line);
			}
		}
	}
});

/*
	IMAGE
*/

RAPID.element({
	name: "image",
	state: {
	},
	init: function() {
		var self = this;
		window.addEventListener("optimizedResize", function() {
			self.render();
		});
		self.render();
	},
	render: function() {
		var domContainer = this.dom["container"];
		var oldSrc = domContainer.src;
		var newSrc = domContainer.src;
		var spl = domContainer.src.split(".");
		var ext = spl[spl.length - 1];
		newSrc = newSrc.replace("_s." + ext, "." + ext).replace("_m." + ext, "." + ext).replace("_l." + ext, "." + ext);
		var widths = domContainer.dataset.rapidImage.split(", ");
		var match;
		for (var ii = 0; ii < widths.length; ii++) {
			var w = widths[ii].split(" "); // w[0] has size, w[1] has suffix
			if (window.innerWidth > w[0]) {
				//console.log("match!!!", w);
				if (!match) {match = w;}
				if (w[0] > match[0]) {
					match = w;
				}
			}
		}
		var size = match[1];
		if (!size) {size = ""}
		//console.log(el.src, match);
		domContainer.src = newSrc.replace("." + ext, size + "." + ext);
	}
});

/*
	EMBED
*/

RAPID.element({
	name: "embed",
	init: function() {
		var domContainer = this.dom["container"];
		var url = domContainer.textContent;

		// determine what domain the url is from
		if (url.includes("youtube.com")) {
			url = url.replace("watch?v=", "embed/");
			var iframe = document.createElement("IFRAME");
			iframe.width = "560";
			iframe.height = "315";
			iframe.src = url;
			domContainer.className = "rapid-embed youtube";
			//delete embed.dataset.rapidEmbed;
			domContainer.innerHTML = "";
			domContainer.appendChild(iframe);
		}
		else if (url.includes("imgur.com")) {
			var blockquote = document.createElement("BLOCKQUOTE");
			blockquote.className = "rapid-embed imgur imgur-embed-pub";
			blockquote.lang = "en";
			blockquote.dataset.id = "a/axcAq"; // TODO

			var a = document.createElement("A");
			a.href = url;
			a.innerHTML = "My Favorite Colorized Historical Photos"; // TODO

			var script = document.createElement("SCRIPT");
			script.setAttribute("async", "");
			script.src = "http://s.imgur.com/min/embed.js";
			script.charset = "utf-8";

			blockquote.appendChild(a);
			blockquote.appendChild(script);

			//insertAfter(blockquote, embed);
			//embed.remove();

			domContainer.innerHTML = "";
			domContainer.appendChild(blockquote);
		}
		else if (url.includes("soundcloud.com")) {
			// we need to query the soundcloud api to get the embed code
			domContainer.className = "rapid-embed soundcloud";
			domContainer.innerHTML = "";
			var inner = document.createElement("DIV");
			domContainer.appendChild(inner);
			var req = new XMLHttpRequest();
			var params = "format=json&url=" + encodeURIComponent(url);
		    req.open("POST", "https://soundcloud.com/oembed", true);
		    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		    req.onreadystatechange = function() {
		    	var statusPassing = "200";
		    	// if working from the filesystem, override statusPassing to "0" since
		    	//	a json file returns req.status == "0" on success
				if (req.readyState == 4 && req.status == statusPassing) {
					var obj = JSON.parse(req.responseText);
					var embedCode = obj.html;
					//iframe.src = obj.src;
					embedCode = embedCode.replace("height=\"400\"", "");
					// TODO: setting innerHTML on callback incurs delay that wipes out overlay we added in prev step
					inner.innerHTML = embedCode;
					//delete embed.dataset.rapidEmbed;
				}
		    };
		    req.send(params); 
		}
	}
});

/*
	NAV
*/

RAPID.element({
	name: "nav",
	init: function() {
		var domContainer = this.dom["container"];
		var allItems = domContainer.querySelectorAll("LI");
		for (var i = 0; i < allItems.length; i++) {
			var item = allItems[i];
			var itemText = item.childNodes[0].textContent.trim();
			console.log("itemText", itemText, item);
			item.childNodes[0].textContent = "";
			var span = document.createElement("SPAN");
			span.innerHTML = itemText;
			item.prepend(span);

			var subList = span.parentNode.querySelector("UL");
			console.log("sublist", subList);
			if (!subList) {
				addClass(span.parentNode, "empty");
			}

			span.onclick = function() {
				var subList = this.parentNode.querySelector("UL");
				if (subList.style.display == "block") {
					subList.style.display = "none";
				}
				else {
					subList.style.display = "block";	
				}
			}
		}
	}
});

/*
	BLOCK
*/

RAPID.element({
	name: "block",
	init: function() {
		var domContainer = this.dom["container"];
		var src = domContainer.dataset.rapidBlock;
		var req = new XMLHttpRequest();
		var params = "";
	    req.open("GET", src);
	    req.onreadystatechange = function() {
	    	console.log("req", req);
	    	var statusPassing = "200";
	    	// if working from the filesystem, override statusPassing to "0" since
	    	//	a json file returns req.status == "0" on success
	    	var isReqHttp = false;
	    	if (src && src.includes("http")) {
	    		isReqHttp = true;
	    	}
	    	if (!isReqHttp && window.location.protocol == "file:") {
				statusPassing = "0";
			}
			//if (req.readyState == 4 && req.status == statusPassing) {
			if (req.readyState == 4) {
				var html = req.responseText;
				console.log("req", html);
				domContainer.innerHTML = html;
			}
	    };
	    req.send(null);
	}
});

RAPID.element({
	name: "gallery",
	init: function() {
		var domContainer = this.dom["container"];
		var src = domContainer.dataset.rapidGallery;

		var req = new XMLHttpRequest();
		var params = "" //"format=json&url=" + encodeURIComponent(url);
	    req.open("GET", src);
	    req.onreadystatechange = (function(that) {
	    	return function() {
		    	var statusPassing = "200";
		    	// if working from the filesystem, override statusPassing to "0" since
		    	//	a json file returns req.status == "0" on success
		    	var isReqHttp = false;
		    	if (domContainer.dataset.rapidGallery && domContainer.dataset.rapidGallery.includes("http")) {
		    		isReqHttp = true;
		    	}
		    	if (!isReqHttp && window.location.protocol == "file:") {
					statusPassing = "0";
				}
				if (req.readyState == 4 && req.status == statusPassing) {
					var json = req.responseText;
					that.state.items = JSON.parse(json);
					//that.state.items = json;
				}
			}
	    }(this));
	    req.send(null);
	}/*,
	render: function() {
		var domContainer = this.dom["container"];
		domContainer.innerHTML = this.state.items;
	}*/
});

// TODO: how can we pull off an autorender with a template? if we omit render the autorender doesn't work well 
//	since this template requires a foreach...

// if there's a state.items and a template, we iterate the items using the template for each item...
//	but then what if an item has a collection of subitems? how will it know to iterate these and apply templates?

RAPID.element({
	name: "cellcalc",
	values: {},
	init: function() {
		var domContainer = this.dom["container"];
		domContainer.classList.add("rapid-cellcalc");
		var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];
		var numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
		var tr;
		var td;
		// create the columns
		var colgroup = document.createElement("COLGROUP");
		var col = document.createElement("COL");
		col.classList.add("row-header-col");
		colgroup.appendChild(col);
		domContainer.appendChild(colgroup);
		// create the header row
		var trh;
		trh = document.createElement("TR");
		domContainer.appendChild(trh);
		th = document.createElement("TH");
		th.classList.add("corner-header-cell");
		trh.appendChild(th);
		for (var ii = 0; ii < 4; ii++) {
			th = document.createElement("TH");
			th.classList.add("col-header-cell");
			th.innerHTML = letters[ii];
			trh.appendChild(th);
		}
		domContainer.appendChild(trh);

		// create the rest of the rows
		for (var i = 0; i < 4; i++) {
			// create the row
			tr = document.createElement("TR");

			// create the header cell for the row
			td = document.createElement("TD");
			td.classList.add("row-header-cell");
			td.innerHTML = numbers[i];
			td.style.width = "2em";
			td.style.textAlign = "center";
			tr.appendChild(td);

			// create the rest of the cells for the row
			for (var ii = 0; ii < 4; ii++) {
				td = document.createElement("TD");
				td.id = letters[ii] + numbers[i];
				td.dataset.rapidRowId = i + 1;
				td.dataset.rapidColId = ii + 1;
				td.classList.add("cell");

				var cel = this;
				cel.state.values = {};
				cel.state.formulas = {};

				function startEdit(el) {
					el.setAttribute("contenteditable", "true");
					el.classList.add("edit");
					setTimeout(function() {
						el.focus();
					}, 50);
				}

				td.addEventListener("keydown", function(e) {
					var thetd = this;
					if (e.key === "Enter") {
						e.preventDefault();
						// jump down to the next row's cell
						var targetCol = parseInt(thetd.dataset.rapidColId);
						var targetRow;
						if (e.shiftKey) {
							targetRow = parseInt(thetd.dataset.rapidRowId) - 1;
						}
						else {
							targetRow = parseInt(thetd.dataset.rapidRowId) + 1;
						}
						var targetId = letters[targetCol - 1] + numbers[targetRow - 1];
						//console.log(targetCol, targetRow, targetId);
						var target = document.getElementById(targetId);
						if (target) {
							startEdit(target);
						}
					}
				});

				td.addEventListener("dblclick", function() {
					var thetd = this;
					startEdit(thetd);
				});

				td.addEventListener("focus", function() {
					var thetd = this;
					if (cel.state.formulas[thetd.id]) {
						thetd.innerHTML = cel.state.formulas[thetd.id];
					}
					else {
						thetd.innerHTML = cel.state.values[thetd.id] || "";
					}
				});
				
				td.addEventListener("blur", function() {
					var thetd = this;
					thetd.removeAttribute("contenteditable");
					thetd.classList.remove("edit");

					if (thetd.innerHTML.startsWith("=")) {
						cel.state.formulas[thetd.id] = thetd.innerHTML;
					}
					else {
						cel.state.values[thetd.id] = thetd.innerHTML;	
					}
					RAPID.computeCellCalcs();
				});

				tr.appendChild(td);
			}
			domContainer.appendChild(tr);
		}
	}
});

// TODO: here we are attaching an arbitrary named func to RAPID global...maybe bad pattern
RAPID.computeCellCalcs = function() {
	for (var i = 0; i < RAPID.elementInstances.length; i++) {
		var cel = RAPID.elementInstances[i];
		if (cel.name == "cellcalc") {
			var domContainer = cel.dom["container"];
			var tds = domContainer.getElementsByClassName("cell");
			for (var ii = 0; ii < tds.length; ii++) {
				var td = tds[ii];
				// eval the formula for this cell, store the computed value for other cells to reference and
				//	show the computed value in the cell
				// TODO: need to handle refs to other sheets here too...if formula contains "!" then use with()
				//	to import that sheet's values into the current context
				if (cel.state.formulas[td.id]) {
					var formula = cel.state.formulas[td.id];
					with (cel.state.values) {
						var computedVal = eval(formula.substring(1));
						td.innerHTML = computedVal;
						cel.state.values[td.id] = computedVal;
					}
				}
				else {
					td.innerHTML = cel.state.values[td.id] || "";
				}
			}
		}
	}
}

RAPID.element({
	name: "dirlist",
	init: function() {
		var domContainer = this.dom["container"];
		var root = domContainer.dataset.rapidDirlist;
		var urlcmd = "http://localhost:9999/getindex?path=" + encodeURIComponent(root);
		var req = new XMLHttpRequest();
	    req.open("GET", urlcmd);
	    req.onreadystatechange = (function(that) {
	    	return function() {
				if (req.readyState == 4) {
					var json = req.responseText;
					if (json) {
						that.state.json = JSON.parse(json);
					}
					else {
						domContainer.innerHTML = "<p class='notice error'><span>ERROR</span><br>Connection refused; could not get directory listing. Make sure the microservice is running on the target host, your connection is working, and the url + directory path given to the Dir List is correct.</p>";
					}
				}
			}
	    }(this));
	    req.send(null);
	},
	render: function() {
		var domContainer = this.dom["container"];
		var nodeCount = 0;
		for (var name in this.state.json) {
			// get the node's info (file system properties) from the index
			var nodeInfo = this.state.json[name];
			nodeInfo.name = name;

			// create the node div element
			var nodeDiv = document.createElement("DIV");
			nodeDiv.id = "node" + nodeCount;
			nodeDiv.innerHTML = name;

			domContainer.appendChild(nodeDiv);

			nodeCount = nodeCount + 1;
		}
		//domContainer.innerHTML = this.state.json;
	}
});