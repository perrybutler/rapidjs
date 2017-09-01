var RAPID = RAPID || {};
RAPID.standardElements = "div, span, p";
RAPID.elements = {};
RAPID.elementInstances = [];

// our global element factory
// defines a custom element for instancing, or instantiates an existing custom element for use
RAPID.element = function(options) {
	var name = options["name"];
	var target = options["target"];
	var state = options["state"];
	var init = options["init"];
	var render = options["render"];

	//console.log("element call ", name, target, state);

	// if (RAPID.standardElements.indexOf(name)) {
	// 	// standard element, create and return it
	// }

	if (!RAPID.elements[name]) {
		// custom element factory does not exist, create and store the factory
		//console.log("storing " + name);
		var celFactory = function() {
			var cel = {};
			cel.name = name;
			cel.state = new Proxy({}, RAPID.elementStateHandler);
			cel.state.owner = cel;
			cel.dom = {};
			cel.init = init;
			cel.render = render;
			//console.log("factory ", cel);
			return cel;
		}
		RAPID.elements[name] = celFactory;
	}
	else {
		// custom element factory found, instantiate it, init and render
		//console.log("fetching " + name);
		var cel = RAPID.elements[name]();
		//console.log("instance ", cel);
		//addClass(cel.dom["container"], "rapid-" + name);
		addClass(target, "rapid-" + name);

		// set up the dom elements
		cel.dom["container"] = target;
		cel.createElement = function(tag, name) {
			var cel = this;
			var target = document.createElement(tag);
			cel.dom[name] = tag;
			cel.dom["container"].appendChild(target);
			return target;
		}

		// set the string-based template, if present
		if (target.innerHTML.includes("<!--")) {
			cel.template = target.innerHTML.replace("<!--", "").replace("-->", "").trim();
		}

		// initialize, if defined
		if (cel.init) {cel.init();}

		// define the render function if user did not define it
		// usually this is when the user defined a string-based template which renders automatically
		if (!cel.render && cel.template) {
			cel.render = function() {
				var fields = cel.template.match(/\{\{\s*\w+\s*\}\}/g);
				if (fields) {
					// TODO: before we do actual replacements, check for foreach
					var container = cel.dom["container"];
					
					var html = "";
					if (cel.template.includes("data-foreach")) {
						var itemsKey = fields[0].replace("{{", "").replace("}}", "");
						var items =  cel.state[itemsKey];
						if (items) {
							for (var i = 0; i < items.length; i++) {
								// clone cel.template into a string
								// replace string with remaining fields
								// append string to final html
								var item = items[i];
								var itemHtml = cel.template;
								for (var ii = 0; ii < fields.length; ii++) {
									var field = fields[ii];
									var fieldInner = field.replace("{{", "").replace("}}", "");
									console.log("field", field, fieldInner, item);
									if (item[fieldInner]) {
										itemHtml = itemHtml.replace(field, item[fieldInner]);
									}
								}
								html += itemHtml;
							}
						}
					}
					else {
						var html = cel.template;
						for (var i = 0; i < fields.length; i++) {
							var field = fields[i];
							var fieldInner = field.replace("{{", "").replace("}}", "");
							if (cel.state[fieldInner]) {
								html = html.replace(field, cel.state[fieldInner]);
							}
						}
					}

					container.innerHTML = html;
				}
			}
		}
		
		//cel.render();
		RAPID.elementInstances.push(cel);
		return cel;
	}
}

// handle state changes using a Proxy() of the element's state object (element.state)
// any time element.state is changed, we can re-render the state's component (state.owner)
RAPID.elementStateHandler = {
	get: function(target, property) {
		//console.log("getting " + property + " for ", target);
		return target[property];
	},
	set: function(target, property, value, receiver) {
		//console.log("setting " + property + " to " + value + " for ", target, receiver);
		target[property] = value;
		//console.log("proxy setter ", target.owner);
		if (target.owner) {
			if (target.owner.render) {
				target.owner.render();
			}
		}
		return true;
	}
}

// mounts all unmounted custom elements
// normally we call this once after initial page load
// TODO: we'll probably need to loop these agnostically and also prioritize certain ones that need parsing first
RAPID.mountAll = function() {
	var startTime = new Date();
	var elements;
	for (var key in RAPID.elements) {
		var celName = key;
		var elements = document.querySelectorAll("[data-rapid-" + celName + "]");
		for (var i = 0; i < elements.length; i++) {
			var el = elements[i];
			console.log("mounting ", el, " with custom " + celName);
			var cel = RAPID.element({
				name: celName,
				target: el,
			});
		}
	}
	var endTime = Math.abs(new Date() - startTime);
	console.log("RAPID mountAll took " + endTime + " ms");
}

// watch the document for DOM changes, and if any nodes are custom elements mount them now
RAPID.observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        //console.log("mutation ", mutation);
        var addedNodes = mutation.addedNodes;
        console.log("addednodes", addedNodes);
        addedNodes.forEach(function(addedNode) {
        	// TODO: this needs some work...addedNodes might have children which aren't being converted here
        	//	and we could probably use a selector instead of looping
        	if (addedNode.dataset) {
        		var data = addedNode.dataset;
        		for (var key in data) {
        			var name = key.replace("rapid", "").toLowerCase();
        			if (RAPID.elements[name]) {
        				//console.log("name", name);
        				var cel = RAPID.element({
        					name: name,
        					target: addedNode,
        				});
        			}
        		}
        	}
        	// select any custom elements in the added node's children and convert them too
        	if (addedNode.nodeType === 1) {
	        	var childNodes = RAPID.selectAllCustomElementsByData(addedNode);
	        	console.log("childnodes", childNodes);
	        	childNodes.forEach(function(childNode) {
	        		var data = childNode.dataset;
	        		for (var key in data) {
	        			var name = key.replace("rapid", "").toLowerCase();
	        			if (RAPID.elements[name]) {
	        				//console.log("name", name);
	        				var cel = RAPID.element({
	        					name: name,
	        					target: childNode,
	        				});
	        			}
	        		}
	        	});
        	}
        });
    });
});

// attach our DOM observer and mount any custom elements that were present before the DOM observer was attached
window.addEventListener("DOMContentLoaded", function() {
	RAPID.mountAll();
	// observe the DOM for changes
	var config = {/*attributes:true,*/ childList:true, subtree:true/*, characterData:true*/}
	RAPID.observer.observe(document.body, config);
});

function hasClass(el, className) {
  if (el.classList)
    return el.classList.contains(className)
  else
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
} // adapted from stackoverflow

function addClass(el, className) {
  if (el.classList)
    el.classList.add(className)
  else if (!hasClass(el, className)) el.className += " " + className
} // adapted from stackoverflow

function removeClass(el, className) {
  if (el.classList)
    el.classList.remove(className)
  else if (hasClass(el, className)) {
    var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
    el.className=el.className.replace(reg, ' ')
  }
} // adapted from stackoverflow

function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
} // adapted from stackoverflow

// this function throttles the window.resize event, which can fire thousands of times per second
// 	to use it we just listen for optimizedResize instead of resize
// TODO: just running a timer to update each custom image element would be more performant than this...
(function() {
	var ev = new CustomEvent("optimizedResize");
	window.addEventListener("resize", resizeThrottler, false);
	var resizeTimeout;
	function resizeThrottler() {
		// ignore resize events as long as an actualResizeHandler execution is in the queue
		if ( !resizeTimeout ) {
			resizeTimeout = setTimeout(function() {
	    		resizeTimeout = null;
	    		actualResizeHandler();
	  		}, 400);
		}
	}
	function actualResizeHandler() {
		window.dispatchEvent(ev);
	}
}()); // adapted from mozilla.org

function toggleOverlays() {
	var overlays = document.querySelectorAll(".rapid-element-overlay");
	if (overlays.length > 0) {
		for (var i = 0; i < overlays.length; i++) {
			removeClass(overlays[i].parentNode, "rapid-overlay");
			overlays[i].parentNode.removeAttribute("draggable");
			overlays[i].remove();
		}
		var diag = document.querySelector(".rapid-diag");
		diag.remove();
	}
	else {
		var elements = RAPID.selectAllCustomElementsByData(document.body); //document.querySelectorAll(allElementsSelector);
		for (var i = 0; i < elements.length; i++) {
			var el = elements[i];
			//console.log("index", i, el);
			addClass(el, "rapid-overlay");
			//el.style.position = "relative";
			var domOverlay = document.createElement("DIV");
			domOverlay.className = "rapid-element-overlay on";
			el.setAttribute("draggable", "true");
			el.appendChild(domOverlay);
		}
		var diag = document.createElement("DIV");
		diag.innerHTML = "Total custom elements: " + elements.length;
		addClass(diag, "rapid-diag");
		document.body.appendChild(diag);
	}
}
document.addEventListener("keydown", function(e) {
	if (e.key == "`") {
		toggleOverlays();
	}
});


RAPID.selectAllCustomElementsByClass = function(node) {
	var allElementsSelector = "";
	for (var key in RAPID.elements) {
		var el = RAPID.elements[key];
		if (allElementsSelector != "") {
			allElementsSelector += ", ";
		}
		allElementsSelector += ".rapid-" + key
	}
	var result = node.querySelectorAll(allElementsSelector);
	return result;
}

RAPID.selectAllCustomElementsByData = function(node) {
	var allElementsSelector = "";
	for (var key in RAPID.elements) {
		var el = RAPID.elements[key];
		if (allElementsSelector != "") {
			allElementsSelector += ", ";
		}
		allElementsSelector += "[data-rapid-" + key + "]";
	}
	var result = node.querySelectorAll(allElementsSelector);
	return result;
}

/*
	MARKDOWN PARSER

	VERY SLOW, FIX LATER
*/

// TODO: test parse against https://daringfireball.net/projects/markdown/syntax.text

// TODO: if we're going to have more custom functions like markdown, maybe we need a customfunctions.js

// TODO: the Custom Elements Explained section gets mangled by the markdown parser because we're using some * characters in the paragraphs

document.addEventListener("DOMContentLoaded", function() {
	//doMarkdown(document.body);
});

var markdownRules = {};

function markdownRule(name, regex, func) {
	var rule = {};
	rule.regex = regex;
	rule.func = func;
	markdownRules[name] = rule;
}

function doMarkdown(domNode) {
	var startTime = new Date();

	markdownRules = {};
	markdownTodo = {};

	markdownRule("strong", /(\*\*|__)(.*?)\1/, function(match, val) {
		var newHtml = val.replace(match[0], "<span class='rapid-markdown-strong'>" + match[2] + "</span>");
		return newHtml;
	});

	markdownRule("em", /(\*+)(.*?)\*+/, function(match, val) {
		var newHtml = val.replace(match[0], "<span class='rapid-markdown-em'>" + match[2] + "</span>");
		return newHtml;
	});

	markdownRule("h2", /(## ).+/, function(match, val) {
		var newHtml = val.replace(match[0], "<h2 class='rapid-markdown-h2'>" + match[0].replace("## ", "") + "</h2>");
		return newHtml;
	});

	markdownRule("h1", /(# ).+/, function(match, val) {
		var newHtml = val.replace(match[0], "<h1 class='rapid-markdown-h1'>" + match[0].replace("# ", "") + "</h1>");
		return newHtml;
	});

	markdownRule("img", /!\[([^\[]+)\]\(([^\)]+)\)/, function(match, val) {
		var spl = val.split("](");
		var newText = spl[0].replace("![", "");
		var newUrl = spl[1].replace(")", "");
		var newHtml = val.replace(match[0], "<img rel='" + newText + "' class='rapid-markdown-img' src='" + newUrl + "'>");
		return newHtml;
	});

	markdownRule("a", /\[([^\[]+)\]\(([^\)]+)\)/, function(match, val) {
		var spl = val.split("](");
		var newText = spl[0].replace("[", "");
		var newUrl = spl[1].replace(")", "");
		var newHtml = val.replace(match[0], "<a class='rapid-markdown-a' href='" + newUrl + "'>" + newText + "</a>");
		return newHtml;
	});

	// broad phase prune - build list of regexes that exist before we test them against each textnode
	for (var ruleName in markdownRules) {
		var rule = markdownRules[ruleName];
		if (rule.regex.exec(domNode.innerHTML) !== null) {
			markdownTodo[ruleName] = rule;
		}
	}

	// walk the domNode to find all textNodes we'll be working with
	var textNodes = [];
	var walkNode;
	var walk = document.createTreeWalker(domNode, NodeFilter.SHOW_TEXT, null, false);
	while (walkNode = walk.nextNode()) {
		textNodes.push(walkNode);
		// TODO: just slap the loop below into here so we only use 1 loop instead of 2?
	}

	// iterate the textNodes looking for regex matches to replace
	for (var i = 0; i < textNodes.length; i++) {
		var node = textNodes[i];
		if (node.parentNode && node.parentNode.classList.contains("nomarkdown") === false) {
			if (node.nodeValue) {
				var newHtml = node.nodeValue;
				// process the nodeValue by iterating over only the regexes that were detected in the domNode
				for (var ruleName in markdownTodo) {
					var rule = markdownTodo[ruleName];
					var match = newHtml.match(rule.regex);
					if (match) {
						newHtml = rule.func(match, newHtml);
						//console.log("match", ruleName, newHtml, match);
					}
				}
				if (newHtml !== node.nodeValue) {
					node.parentNode.innerHTML = newHtml;
				}
			}			
		}
	}

	var endTime = Math.abs(new Date() - startTime);
	console.log("RAPID markdown took " + endTime + " ms");
}