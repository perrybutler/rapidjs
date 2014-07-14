rapid.js
========

Rapid.js is a Javascript templating engine designed for the [Rapid Platform](https://github.com/perrybutler/rapid-platform). Currently, Rapid Platform is provided via a WordPress theme/plugin, but this library will aid in the transition over to a pure Javascript architecture that can be utilized in any solution - not just WordPress - while still providing all of the same benefits as well as opening up the possibility for greater things.

Our goal is to shrink the development workflow as much as possible without sacrificing functionality, or introducing custom syntax, overzealous patterns and extra steps into the process. Too many frameworks trash the working spec or hack around it, favoring convenience (laziness) over intuitiveness. Other frameworks will eat your soul for breakfast before giving you what you want.

A templating engine is essentially a pre-hypertext processor that usually operates at the client, much like how PHP works at the server. Some engines are highly ambitious, but let us not forget that they are essentially doing what PHP does: pre-processing html before it is rendered by the browser. Rapid.js does not have an identity crisis in that respect.

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

Before planning the Rapid.js architecture, an extensive review was conducted on the current state of affairs. This review included (but was not limited to): PHP, Smarty, EJS, Django, Angular.js (Google), Backbone.js, Jade, Mustache.js, Handlebars.js, Hogan.js (Twitter), Dust.js (Linked-In), Transparency.js, ICanHaz.js, Weld.js, Ractive.js, React.js, Polymer (Google), Micro-Templates (Resig), jQuery Templates, jsRender, jQote, Markup.js, Underscore, Ember.js, doT.js.

We also conducted a review of emerging and future techniques such as: template element, custom elements, web components, Shadow DOM, AMD, Common.js, Require.js, etc.

Performance is always a trade-off that is mostly dependant upon what processing happens at the server and what processing happens at the client. It comes down to a choice between:

1. Download less data from the server (pre-formatted JSON) and convert this data to HTML at the client then push it into the DOM.
2. Download more data from the server (pre-rendered HTML) and push this data into the DOM at the client.

This is where most templating engines differ the most. In the case of Rapid.js, the client will request JSON data from the server, then format and render this data however it sees fit without help from the server for presentation. However, this also means heavy processing at the client. The reverse method would create heavier load on the server and require more bandwidth. It's easy to simply throw more hardware at a server to increase performance since you can't do the same for every client, but this creates a scaling problem at the server. And client processing is likely to get a whole lot faster in the next few years, whereas server bandwidth (millions of users) will continue to be a limiting factor.

A benchmark of client vs. server templating can be found [here](http://ryanflorence.com/2012/client-v-server-templating/). The pros and cons of client vs. server templating can be found [here](http://openmymind.net/2012/5/30/Client-Side-vs-Server-Side-Rendering/). For what it's worth, we have implemented all of these methods in past projects, including the optimized versions mentioned in the article, providing us with insight into the various flavors of templating engines.

Anyhow, with the rise of single page apps (SPA), we're finding more and more reasons to let the client be the ultimate determining factor in how a data set will be displayed, and in what format. This means the data source (server) is  completely decoupled from the client logic, or at least agnostic to it, meaning several apps could implement the same data in different ways - your app becomes a clean api endpoint that can be consumed by other services/apps. We also want to give end-users full expressive power over building their own views and templates using a WYSIWYG editor and plugging in data however they see fit. The end-user can apply different views to existing data on-the-fly without having to request anything from the server.

We are quickly approaching a hybrid computing paradigm that lies between "thin client" and "thick client", where the SPA will download and cache data/resources as it uses them over the lifetime of the session or even across multiple sessions so that the app works in an offline state or degrades gracefully into something less functional temporarily.
