Rapid.js
========

![rapid.js](http://glassocean.net/media/rapidjs.jpg)

Write Once, Run Anywhere.

Rapid.js is a Javascript framework in development for the [Rapid Platform](https://github.com/perrybutler/rapid-platform). Currently, Rapid Platform is provided via a WordPress theme/plugin, but this library will aid in the transition over to a pure Javascript architecture that can be utilized in any solution - not just WordPress - while still providing all of the same benefits as well as opening up the possibility for greater things.

Our goal is to **shrink the development workflow** as much as possible **without sacrificing functionality**, or introducing custom syntax, overzealous patterns and extra steps into the process.

Future ambitions include providing the features and components necessary to deploy a cross-platform, scalable and distributed architecture with ease (e.g. budget Hadoop); git deployments (e.g. Heroku); a document-oriented semi-structured meta-database (e.g. NoSQL, XML, JSON) that can link anything to anything including filesystem objects across any node in the distributed environment; a message mediator for authentication, load balancing, and intelligent message routing via queues (point-to-point) and topics (publish/subscribe); a binary communications protocol (e.g. loosely coupled Protobuf) with fallbacks (e.g. WebSockets/Comet/CometD/Bayeux) for high interoperability; web components with 1-way, 2-way (e.g. Angular), and 3-way (e.g. Meteor) binding for building real-time apps that adhere to unobtrusive UI/UX principles; and no single-point of failure (e.g. MongoDB).

#How It Works#

***Note: This prototype is from an early test run. Many details have changed over time and this section could use an update.***

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

## Benchmarks

I came across a [benchmark](http://chrisharrington.github.io/demos/performance/) by Chris Harrington that compares React, Angular, Knockout and Raw DOM performance for rendering a list of 1000 items. Overall the results are no surprise, but what's interesting is the fact that Raw DOM is almost 5 times faster than any of these frameworks. Clearly, there's room for improvement. I'd like to see how other frameworks such as Mithril and Riot compare, but before that, I decided to see how an early Rapid.js prototype could perform.

Here are the results:

* Rapid.js 140ms
* ReactJS 170ms
* AngularJS 380ms

Is this important? Not really, as Rapid.js is currently nothing more than a few experimental implementations of templating and data binding at the moment. You cannot build anything with it yet.

Achieving the score was easy though. We include a bare minimum list template (one wrap element and one list item element) as an HTML template element in the page, or as an HTML string in the component itself. Either way, the template ends up in the component instance as a real DOM node in memory. From there, we iterate the dataset and clone the single list item element for each record in the dataset. jQuery was used, which does add further overhead to performance.

In comparison, React's Virtual DOM can batch the cloning of these nodes in memory and push out all 1000 items as a single DOM update (or a few?), but even then, cloning the DOM node in a loop with jQuery was faster. I can only conclude that this limited scenario is not a good test of React's Virtual DOM. I'd like to try a few more tests, one where we just push the entire pre-rendered list (HTML string) into the DOM, and another where we batch the cloning of DOM nodes in memory and then push that whole collection into the DOM with a single call.

## Challenges

### Challenge 1 - Carousel

Challenges help us experiment with a goal in mind and determine the capabilities of the prototype as it develops. While a TodoMVC example is on the list, the first challenge I've selected is to build a Carousel widget that rotates through a collection of slides, with an extra twist...

Each slide consists of a background image and three pieces of text that sit above the background - very typical for a Carousel widget. The twist is that when you view a page with the Carousel on it and you see it animating, you may edit the Carousel in its live form. Clicking into one of the text pieces (a contenteditable div) calls stop() automatically, which pauses the Carousel animation so the slide doesn't change while you are editing the text. When changes are made to the text (on input), the component automatically updates its internal data model (JSON) which contains the slide's data. Now, and next time that slide is displayed, the new value is shown. This DOM -> JSON synchronization happens immediately, but we'll likely want to buffer this so we aren't firing updates on every keystroke.

Every Rapid.js component contains a data property. When the Carousel component is designed, we include some default data so the component can be rendered correctly on a page which the user can start working with:

```
me.data = {
    "slides": [
    {
        "bg": "1.jpg",
        "bgpos": "bottom_center",
        "txt1": "",
        "txt2": "Perry Butler",
        "txt3": "Software Engineer + IT Manager"
    },
    {
        "bg": "2.jpg",
        "bgpos": "bottom_center",
        "txt1": "Hello World",
        "txt2": "This is Slide 2",
        "txt3": "Subtitle goes here"
    },
    {
        "bg": "3.jpg",
        "bgpos": "top_left",
        "txt1": "Third slide",
        "txt2": "Custom text here",
        "txt3": ""
    }
    ]
}
```

![carousel](https://cloud.githubusercontent.com/assets/3649315/6537938/8a9e637c-c410-11e4-9d88-d4fd16b39f8e.jpg)

We're not done yet. The next part is to build a Property List component which renders a data-bound list of key:value pairs representing a flat JSON structure. Most components have one or more properties, so having a universal way to view a collection of properties and edit them can be handled by this new Property List component. You can think of it like the Properties panel in Visual Studio - as you develop a custom control (component class) in Visual Studio, the class' public properties automatically show up in the Properties panel of the IDE, populated with values for the selected control instance.

With the Carousel and Property List, the last component we need is a Lightbox. Basically, what we are trying to do is provide a popup window where you may edit the Carousel and its slides via a Property List, offering something like a settings dashboard for the component, except the Property List and Lightbox work together to create the whole thing dynamically.

Finally, when the Lightbox appears and a Carousel property gets changed via the Property List, the Carousel data is updated immediately because the Property List has a reference to the Carousel and its JSON data. This works because we pass the Carousel instance (or just the data) to the Property List instance when we create it, and the Property List iterates the data, outputting the key:value pairs into the DOM using contenteditable divs, automatically data-binding those divs to the data so that input in the Property List directly modifies the Carousel data.

The last step is to have the Carousel refresh itself on the page, so that a change via the Property List is immediately reflected in the DOM / live Carousel. This is where we start looking at 1-way binding, 2-way binding, and/or object.observe(). Still a work in progress.

Some other things being experimented with include pushing the component's JSON into localStorage, allowing the component (and app) to survive a full page or browser reload. It also eases the burden of bad network connections and working offline, where changes to a data structure do not require an immediate round trip to a server for validation. In some way the DOM is like an etch-a-sketch, highly volatile and easily destructable, therefore the state of a component (or entire app) probably doesn't belong in the DOM. Mind you, AngularJS and Polymer are leaning ever more towards DOM == state, so this is just my opinion. I'm only wondering how they intend on serializing or maintaining an app and its state as it is mostly scattered throughout the DOM? By having an app's state centralized and available to us at any time, we can save/restore the app to that very state later, and snapshots of the app can be provided, possibly offering an undo mechanism.

What's the point of all this? Rapid.js is being prototyped to take web components to a new level of awesome, one which offers live WYSIWYG editing capabilities. It's like the utility of Visual Studio built into every component. Nothing is more liberating than being able to fine tune any aspect of your web site or app *in its live form*, without having to break out of your casual workflow, jump into your development environment, take a backup, make changes to the code, debug and commit, then roll out an update for the site/app. That's too much hokey pokey when all we wanted to do was hit "Switch to Edit mode" and change "this text is SO cool" to "this text isn't very cool".

You might think this is sounding more and more like the job of a CMS, but we must remember that a CMS is loosely based around using templates (Pages, Posts, Galleries, etc) and widgets anyway, and it's the same problem Javascript frameworks and Web Components set out to solve. If you think about it, Web Components have a lot of "content management" opportunity baked in. They literally take the idea of WordPress templates and shortcodes one step further, in a web standards sort of way. Therefore, Web Components will likely spur big changes in the way we think about the CMS. Compare the following *Polymer web component*, *WordPress shortcode* and *React Component*:

***Polymer Web Component:***

&lt;google-map lat="37.790" long="-122.390"&gt;&lt;/google-map&gt;

***WordPress Shortcode:***

[google-map lat="37.790" long="-122.390"]

***React Component:***

&lt;GoogleMap lat="37.790" long="-122.390"/&gt;

These *component instances* get mixed in with other HTML to produce a final component or web page. Polymer and React pre-process the component at the client-side, while WordPress pre-processes the shortcode at the server-side. Other than that, it's pretty much *the exact same idea*.

***Bonus - Mozilla XBL/XUL and Microsoft XAML:***

&lt;google-map lat="37.790" long="-122.390"&gt;&lt;/google-map&gt;

&lt;GoogleMap lat="37.790" long="-122.390"/&gt;

As we can see, templated re-usable components and UI have been a "thing" for quite some time; most frameworks take a similar approach. [Relevant](http://en.wikipedia.org/wiki/User_interface_markup_language).

### Challenge 2 - CMS

This challenge is actually what sparked the development of Rapid.js and it incorporates the very first prototype. I've taken a step back from the Mist project to focus on a core framework that can support it - Rapid.js. I did capture a video of Mist's early functionality and features before shifting focus:

[![Mist Alpha Preview](http://img.youtube.com/vi/bYpOtAr1WiI/0.jpg)](https://www.youtube.com/watch?v=bYpOtAr1WiI)

You'll notice how lightning fast everything is - switching between categories and sorting hundreds of media items occurs in a fraction of a second. The sort criteria are dyanmically populated based on what is available for that media category.

##OMG, Another Templating Engine?#

Yes.

*Before planning the Rapid.js architecture, an extensive review was conducted on the current state of affairs surrounding templating and data binding related frameworks and platforms:*

Meteor, PHP, Ruby on Rails, Smarty, EJS, Django, AngularJS (Google), Backbone.js, Jade, Mustache.js, Handlebars.js, HTMLBars (Ember), Hogan.js (Twitter), Dust.js (LinkedIn, PayPal), Transparency.js, ICanHaz.js, Weld.js, Ractive.js (TheGuardian), React.js (Facebook, Instagram), Flux (Facebook), Swarm.js, Polymer (Google), Micro-Templates (Resig), jQuery Templates, jsRender, jQote2, Markup.js, Underscore, Ember.js, doT.js, soma-template, PURE.js, Cindy, Moulder, Rivets.js, KnockoutJS, Vue.js, Mithril, Firebase, Thrift (Apache), Protobuf (Google), Cap'n Proto (ex-Google), Node.js, Express, Socket.io, SockJS, SailsJS, ThreeJS, Riot (Muut), Sandstorm.io. Framework fatigue is now!

*I've also reviewed legacy, modern, emerging and future techniques/patterns such as:*

mediator pattern, message queues, DCOM (Microsoft), RPC, CORBA, IOCP, ascii/binary serialization, REST, SOAP, CRUD, MVVM, MVC, MVP, OAuth, contenteditable, localstorage, remotestorage, object.observe(), template element, custom elements, web components, websockets, WebRTC, Comet (long polling/SSE), 3-Way Binding, Shadow DOM, AMD, Common.js, Require.js, CSS3D, WebGL, etc.

##The Endless Frontier

Despite all of these options, technology is advancing so quickly that I'd say half of the frameworks listed above will become obsolete in the next 2 years if they haven't already. Regardless of hype words, we are on the cusp of "Web 3.0" with web components finally becoming all the rage, and we're transitioning into "Web 4.0" soon where our desktop OS and apps will make a full migration to the web; it's something I've been pushing for years through my research and developments with Nest and Rapid.js.

In the near future we are also looking at separating apps from their data, which enables users to own their data and store it where they want. We will start hearing more about "serverless apps" and the "unhosted" movement, which means apps are not strongly coupled to a backend server or require no server at all, freeing developers from the goliath clutches of comparatively numerous SaaS providers. We will start seeing apps use distributed and peer-to-peer technologies, incorporating truly portable widgets (web components) and data from numerous sources, without relying on a central server. Regardless of what you call this - "decentralization", "distributed computing", "private cloud", "serverless", "unhosted", "peer-to-peer" - it is happening right now.

##On Single Page Apps

Anyhow, with the rise of single page apps (SPA), we're finding more and more reasons to let the client be the ultimate determining factor in how a data set will be displayed, and in what format. This means the data source (server) is  completely decoupled from the client logic, or at least agnostic to it, meaning several apps could implement the same data in different ways - your data becomes a clean API endpoint that can be consumed by other services/apps. We also want to give end-users full expressive power over building their own views and templates using a WYSIWYG editor and plugging in data however they see fit. The end-user can apply different views to existing data on-the-fly without having to request anything from the server.

We are quickly approaching a hybrid computing paradigm that lies between "thin client" and "thick client", where the SPA will download and cache data/resources as it uses them over the lifetime of the session or even across multiple sessions so that the app works in an offline state or degrades gracefully into something less functional temporarily.

#History

Much of the grandiose ideas herein are inspired by [NEST](http://glassocean.net/nest/) - a previous HTML5 project similar to a "personal cloud" which incorporates individual apps like an OS that will eventually be rewritten using the Rapid Platform - and [DotNetSockets](https://github.com/perrybutler/dotnetsockets), another previous project that allows client/server communication via serialization/marshaling of objects into binary packets, transmission of those packets over TCP/IP, and deserialization/unmarshaling of those packets into the original language-native objects at the receiving end, offering an asynchronous RPC/MOM framework.
