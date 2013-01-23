var Path = require('path'),
    fs = require('fs'),
    relationLabelByType = {
        HtmlScript: '<script>',
        HtmlStyle: '<style>',
        HtmlCacheManifest: '<html manifest>',
        HtmlIFrame: '<iframe>',
        HtmlFrame: '<frame>',
        HtmlAlternateLink: '<link rel=alternate>',
        HtmlConditionalComment: function (htmlConditionalComment) {return '<!--[if ' + htmlConditionalComment.condition + ']>';},
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

module.exports = function (name) {
    name = (name || 'assetviz');
    var targetFileName = name + '.html',
        data = {
            assets: [],
            relations: []
        };

    return function drawGraph(assetGraph, cb) {
        var idx = 0,
            vizGraph = new assetGraph.constructor({ root: Path.normalize(Path.dirname(module.filename) + '/tpl/') }),
            query = assetGraph.constructor.query;

        assetGraph.findAssets().forEach(function (asset) {
            if (asset.url || asset.outgoingRelations.length) {
                asset.idx = idx;
                data.assets.push({
                    path: asset.url ? Path.relative(assetGraph.root, asset.url) : '',
                    fileName: (asset.url ? Path.basename(asset.url) : 'i:' + asset).replace(/"/g, '\\"'),
                    type: asset.type.toLowerCase()
                });
                idx += 1;
            }
        });

        assetGraph.findRelations({}, true).forEach(function (relation) {
            if ('idx' in relation.from && 'idx' in relation.to) {
                var typeString = relationLabelByType[relation.type] || '';
                if (typeof typeString === 'function') {
                    typeString = typeString(relation);
                }
                data.relations.push({
                    source: relation.from.idx,
                    target: relation.to.idx,
                    type: typeString
                });
            }
        });

        var dataString = 'var assetgraph = ' + JSON.stringify(data, undefined, 4);

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
            .writeStatsToStderr()
            .run(function (err) {
                if (err) {
                    console.error(err);
                }
            });

        cb();
    };
};
