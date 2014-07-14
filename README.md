rapid.js
========

Rapid.js is a Javascript templating engine designed for the [Rapid Platform](https://github.com/perrybutler/rapid-platform). Currently, Rapid Platform is provided via a WordPress theme/plugin, but this library will aid in the transition over to a pure Javascript architecture that can be utilized in any solution - not just WordPress - while still providing all of the same benefits and opening up the possibility for greater things.

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
