/*jshint onevar:false*/

var Path = require('path'),
    fs = require('fs'),
    relationLabelByType = {
        HtmlScript: '<script>',
        HtmlStyle: '<style>',
        HtmlCacheManifest: '<html manifest>',
        HtmlIFrame: '<iframe>',
        HtmlFrame: '<frame>',
        HtmlAlternateLink: '<link rel=alternate>',
        HtmlConditionalComment: function (htmlConditionalComment) {return '<!--[if ' + htmlConditionalComment.condition + ']>'; },
        HtmlImage: '<img>',
        HtmlAudio: '<audio>',
        HtmlShortcutIcon: 'icon',
        HtmlVideo: '<video>',
        HtmlVideoPoster: '<video poster>',
        HtmlEmbed: '<embed>',
        HtmlApplet: '<applet>',
        HtmlObject: '<object>',
        HtmlEdgeSideInclude: '<esi:include>',
        HtmlAnchor: '<a>',
        HtmlRequireJsMain: 'data-main',
        JavaScriptInclude: 'INCLUDE',
        JavaScriptGetText: 'GETTEXT',
        JavaScriptGetStaticUrl: 'GETSTATICURL',
        JavaScriptAmdDefine: 'define',
        JavaScriptAmdRequire: 'require',
        CssImage: 'background-image',
        CssImport: '@import',
        CssBehavior: 'behavior',
        CssFontFaceSrc: '@font-face src',
        CssAlphaImageLoader: 'AlphaImageLoader'
    };

module.exports = function (config) {
    config = config || {};
    var name = (name || 'assetviz'),
        targetFileName = name + '.html',
        verbose = config.verbose,
        data = {
            assets: [],
            relations: []
        };

    return function drawGraph(assetGraph, cb) {
        var idx = 0,
            vizGraph = new assetGraph.constructor({ root: Path.normalize(Path.dirname(module.filename) + '/tpl/') }),
            query = assetGraph.constructor.query;

        assetGraph.findAssets().forEach(function (asset) {
            if (verbose || asset.url || asset.outgoingRelations.length) {
                asset.idx = idx;
                var size = 400;
                if (asset.url && asset.isLoaded) {
                    size = asset.rawSrc.length;
                }
                data.assets.push({
                    path: asset.url ? Path.relative(assetGraph.root, asset.url) : '',
                    fileName: (asset.url ? Path.basename(asset.url) : 'i:' + asset).replace(/"/g, '\\"'),
                    type: asset.type.toLowerCase(),
                    size: size,
                    r: 3 + Math.sqrt(size / 100),
                    outgoing: 0,
                    initial: asset.isInitial
                });
                idx += 1;
            }
        });

        assetGraph.findRelations().forEach(function (relation) {
            if (verbose || ('idx' in relation.from && 'idx' in relation.to)) {
                var typeString = relationLabelByType[relation.type] || '';
                if (typeof typeString === 'function') {
                    typeString = typeString(relation);
                }
                data.assets[relation.from.idx].outgoing += 1;
                data.relations.push({
                    source: relation.from.idx,
                    target: relation.to.idx,
                    type: typeString
                });
            }
        });

        var dataString = 'var assetgraph = ' + JSON.stringify(data, undefined, 4);

        // Protection against browser misinterpretation of tags in content
        dataString = dataString.replace(/"</g, '"<"+"');

        vizGraph.on('error', function (err) {
                console.error((err.asset ? err.asset.urlOrDescription + ': ' : '') + err.stack);
                process.exit(1);
            })
            .loadAssets([
                'index.html'
            ])
            .populate({
                followRelations: {
                    type: query.not(['HtmlAnchor'])
                }
            })
            .queue(function injectAssetData(assetGraph) {
                assetGraph.findAssets({
                    type: 'JavaScript',
                    fileName: 'data.js'
                })[0].text = dataString;
            })
            .inlineRelations({
                type: ['CssImage', 'HtmlImage', 'HtmlShortcutIcon', 'HtmlAppleTouchStartupImage']
            })
            .inlineRelations({
                type: ['CssFontFaceSrc']
            })
            .inlineRelations({
                type: ['CssBehavior']
            })
            /*
            .compressJavaScript({type: 'JavaScript'}, 'uglifyJs')
            .minifyAssets({
                type: ['Html', 'JavaScript', 'Css']
            })
            */
            // inline style and script
            .inlineRelations({ type: ['HtmlStyle', 'HtmlScript'] })
            .moveAssets({type: 'Html', isInline: false}, function (asset) {
                return "file://" + Path.normalize(targetFileName);
            })
            .writeAssetsToDisc({url: /^file:/})
            .run(function (err) {
                if (err) {
                    console.error(err);
                }
            });

        cb();
    };
};
