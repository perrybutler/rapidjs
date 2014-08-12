Rapid.js
========

Write Once, Run Anywhere.

Rapid.js is a Javascript framework in development for the [Rapid Platform](https://github.com/perrybutler/rapid-platform). Currently, Rapid Platform is provided via a WordPress theme/plugin, but this library will aid in the transition over to a pure Javascript architecture that can be utilized in any solution - not just WordPress - while still providing all of the same benefits as well as opening up the possibility for greater things.

Our goal is to **shrink the development workflow** as much as possible **without sacrificing functionality**, or introducing custom syntax, overzealous patterns and extra steps into the process.

Future ambitions include providing the features and components necessary to deploy a cross-platform, scalable and distributed architecture with ease (e.g. budget Hadoop); git deployments (e.g. Heroku); a document-oriented semi-structured meta-database (e.g. NoSQL, XML) that can link anything to anything including filesystem objects across any node in the distributed environment; a message mediator for authentication, load balancing, and intelligent message routing via queues (point-to-point) and topics (publish/subscribe); a binary communications protocol (e.g. loosely coupled Protobuf) with fallbacks (e.g. WebSockets/Comet/CometD/Bayeux) for high interoperability; web components with 1-way, 2-way (e.g. Angular), or 3-way (e.g. Meteor) binding for building real-time apps that adhere to unobtrusive UI/UX principles; and no single-points of failure. Just kidding, that last one is a pipe dream.

#How It Works#

**Data:**

    <Games>
    <Game>
	    <Properties>
		    <ID>3ead9ed3-94fd-4ec5-9c91-2a5b565175c6</ID>
		    <Title>Galaga</Title>
		    <ReleaseDate>1981-08-01T00:00:00-07:00</ReleaseDate>
		    <Rating />
		    <Genre>Shooter</Genre>
		    <Platform>Arcade</Platform>
		    <Developer>Namco</Developer>
		    <Publisher>Midway</Publisher>
	    </Properties>
	    <Boxart>front.jpg,back.jpg</Boxart>
	    <Fanart>7861-1.jpg,7861-2.jpg</Fanart>
    </Game>
    <Game>
	    <Properties>
		    <ID>3d779477-f7b5-44cb-8920-ae7843d72b2e</ID>
		    <Title>Space Invaders</Title>
		    <ReleaseDate>1978-06-01T00:00:00-07:00</ReleaseDate>
		    <Rating>E - Everyone</Rating>
		    <Genre>Shooter</Genre>
		    <Platform>Arcade</Platform>
		    <Developer>Taito Corporation</Developer>
		    <Publisher>Midway Games</Publisher>
	    </Properties>
	    <Boxart>front.jpg,front2.jpg</Boxart>
	    <Fanart>116-1.jpg,116-2.jpg,116-3.jpg</Fanart>
    </Game>
    </Games>

**Output a list of Games:**

    [each {Games}]
	    <div>
		    <img src='{Game.Boxart(0)}' />
		    <span>{Game.Properties.Title}</span>
	    </div>
    [/each]

**Output an Edit Game menu:**

    <h2>Edit Game</h2>
    <span>{Properties.Title}</span>
    <img src='{Game.Boxart(0)}'/>
    <h3>Properties</h3>
    [property-list props='{Game.Properties}']
    <h3>Boxart</h3>
    [image-list images='{Game.Boxart}' root='{Properties.Title}.{Properties.ID}']
    <h3>Fanart</h3>
    [image-list images='{Game.Fanart}' root='{Properties.Title}.{Properties.ID}']

The component [property-list] renders a list of label:field pairs for each property (ID, Title, ReleaseDate, etc).

The component [image-list] renders a gallery of images that supports drag-drop arrangement and moving images between lists.

All files for a record are stored in an indexed folder, and any time we make use of a file (say an image) within the app we create a soft link to that resource in the data set (not a hard path). This lets the end-user sort a list of images any way desired, and deliver them in a certain order to their templates, because it's a virtual list not a directory.

This is built around semi-structured data, currently XML for flexibility and quick development. The plan is to use NoSQL for a document-oriented database that is fully customizable by the end-user.

Unlike Ember.js components and WordPress shortcodes, this system should support nested components of the same type. For example:

    [each {a}]
        <span>{a.Property1}</span>
        [each {b}]
            <span>{b.Property1}</span>
        [/each]
    [/each]

or:

    [grid span="1" count="4"]
        [grid span="1" count="2"]

        [/grid]
    [/grid]

Nested components/shortcodes will be achieved through a custom parser.

#OMG, Another Templating Engine?#

Yes.

Before planning the Rapid.js architecture, an extensive review was conducted on the current state of affairs. This review included (but was not limited to): Meteor, PHP, Ruby on Rails, Smarty, EJS, Django, Angular.js (Google), Backbone.js, Jade, Mustache.js, Handlebars.js, Hogan.js (Twitter), Dust.js (Linked-In), Transparency.js, ICanHaz.js, Weld.js, Ractive.js (TheGuardian), React.js (Facebook), Polymer (Google), Micro-Templates (Resig), jQuery Templates, jsRender, jQote2, Markup.js, Underscore, Ember.js, doT.js, soma-template.

We also conducted a review of emerging and future techniques such as: Object.observe(), template element, Custom Elements, Web Components, WebSockets, Comet (long polling/SSE), 3-Way Binding, Shadow DOM, AMD, Common.js, Require.js, etc.

Performance is always a trade-off that is mostly dependant upon what processing happens at the server and what processing happens at the client. It comes down to a choice between:

1. Download less data from the server (pre-formatted JSON) and convert this data to HTML at the client then push it into the DOM.
2. Download more data from the server (pre-rendered HTML) and push this data into the DOM at the client.
3. Download potentially less data from the server (pre-compiled Javascript templating functions with baked in data/behavior) and utilize the functions at the client which builds and pushes DOM elements into the DOM. This seems to divide the work load better than 1 or 2.

This is where the various templating engines differ the most. In the case of Rapid.js, the client will request JSON data from the server, then format and render this data however it sees fit without help from the server for presentation. However, this also means heavy processing at the client. The reverse method would create heavier load on the server and require more bandwidth. It's easy to simply throw more hardware at a server to increase performance since you can't do the same for every client, but this creates a scaling problem at the server. And client processing is likely to get a whole lot faster in the next few years, whereas server bandwidth (lots of users) will continue to be a limiting factor.

A good look at the present state of client/server applications, and where the future is headed, can be found [here](https://blog.engineyard.com/2014/the-client-server-see-saw). A benchmark of client vs. server templating can be found [here](http://ryanflorence.com/2012/client-v-server-templating/). The pros and cons of client vs. server templating can be found [here](http://openmymind.net/2012/5/30/Client-Side-vs-Server-Side-Rendering/) and [here](http://www.forbes.com/sites/quora/2014/07/14/what-is-the-most-valuable-programming-language-to-know-for-the-future-and-why/). For what it's worth, we have implemented all of these methods in past projects, including the optimized versions mentioned in the articles, providing us with insight into the various flavors of templating engines.

Anyhow, with the rise of single page apps (SPA), we're finding more and more reasons to let the client be the ultimate determining factor in how a data set will be displayed, and in what format. This means the data source (server) is  completely decoupled from the client logic, or at least agnostic to it, meaning several apps could implement the same data in different ways - your data becomes a clean API endpoint that can be consumed by other services/apps. We also want to give end-users full expressive power over building their own views and templates using a WYSIWYG editor and plugging in data however they see fit. The end-user can apply different views to existing data on-the-fly without having to request anything from the server.

We are quickly approaching a hybrid computing paradigm that lies between "thin client" and "thick client", where the SPA will download and cache data/resources as it uses them over the lifetime of the session or even across multiple sessions so that the app works in an offline state or degrades gracefully into something less functional temporarily.

#History

Much of the grandiose ideas herein are inspired by [NEST](http://glassocean.net/nest/) - a previous HTML5 project that will eventually be rewritten using the Rapid Platform - and [DotNetSockets](https://github.com/perrybutler/dotnetsockets), another previous project that allows client/server communication via serialization/marshaling of objects into binary packets, transmission of those packets over TCP/IP, and deserialization/unmarshaling of those packets into the original language-native objects at the receiving end, offering an asynchronous RPC-like framework.
