# AssetViz

A command line web application source code visualization tool.

![Example](https://raw.github.com/munter/assetviz/master/example/assetviz.png)

## Installation

```
npm install assetviz
```

If you get installation errors for node-canvas, don't despair. It's an optional dependency used by [Assetgraph](https://github.com/One-com/assetgraph) to do some other cool stuff that isn't used in AssetViz.

## Usage


```
$ assetviz [-h] [-v] [-r /path/to/webroot] /path/to/webroot/index.html
$ google-chrome assetviz.html
```

The command line tool outputs an html-file called `assetviz.html` in the current working directory.

### Arguments:

- Any number of html.files
- A path, assetviz will look for `index.html` in that path
- A minimatch pattern like `path/to/webroot/**/*.html`
- An URL *(yes, you read that right)*

### Parameters:

**-h** : **Help**

**-v** : **Verbose**. Includes inline assets in the output graph. If unset only inline elements relevant to describe file relations will be shown.

**-r** : **Root**. Tells AssetViz which directory to treat as the web root. Only useful if you are graphing an html-file that has relations outside its own directory.

## AssetViz output

The outputted graph html-file is called `assetviz.html`. It is a self contained file with no external dependencies, so you can upload it anywhere, email it or do whatever you want with it without worrying about dependencies or being online to view.

While viewing the graph you can use the mousewheel to zoom and click+drag to pan (google maps style navigation).


## Future roadmap

- Improve text rendering
- Highlight relations on hover
- Relation direction with arrow heads
- Merge visualization template with [grunt-dependencygraph](https://github.com/auchenberg/grunt-dependencygraph)


## Thanks to

[Andreas Lind Petersen](https://github.com/papandreou) for all his wonderful work on [Assetgraph](https://github.com/One-com/assetgraph). We have barely scratched the surface of the potential this project has.
[Kenneth Auchenberg](https://github.com/auchenberg) for his visualization work and revitalization of the source code visualization dream.


## License

[MIT](https://raw.github.com/munter/assetviz/master/LICENSE.txt)
