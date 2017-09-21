describe('TileLayer', function () {

    var container;
    var map;
    var center = new maptalks.Coordinate(118.846825, 32.046534);

    function createMap() {
        container = document.createElement('div');
        container.style.width = '3px';
        container.style.height = '3px';
        document.body.appendChild(container);
        var option = {
            zoom: 17,
            center: center
        };
        map = new maptalks.Map(container, option);
    }

    beforeEach(function () {

    });

    afterEach(function () {
        if (map) {
            map.remove();
        }
        REMOVE_CONTAINER(container);
    });

    describe('add to map', function () {
        it('add again', function (done) {
            createMap();
            var tile = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                urlTemplate : '/resources/tile.png'
            });
            tile.once('layerload', function () {
                expect(tile).to.be.painted();
                map.removeLayer(tile);
                tile.once('layerload', function () {
                    expect(tile).to.be.painted();
                    done();
                });
                map.addLayer(tile);
            });
            map.addLayer(tile);
        });

        it('set tile size', function () {
            createMap();
            var tile1 = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                urlTemplate : '/resources/tile.png',
                tileSize : [1, 2]
            });
            expect(tile1.getTileSize().toArray()).to.be.eql([1, 2]);

            var tile2 = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                urlTemplate : '/resources/tile.png',
                tileSize : { width : 1, height : 2 }
            });

            expect(tile2.getTileSize().toArray()).to.be.eql([1, 2]);
        });
    });

    describe('Different Projections', function () {
        it('webmercator', function (done) {
            createMap();
            var tile = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                fadeAnimation : false,
                debug : true,
                urlTemplate : '#'
            });
            tile.on('layerload', function () {
                done();
            });
            map.setBaseLayer(tile);
        });

        it('lonlat', function (done) {
            createMap();
            map.config({
                minZoom:1,
                maxZoom:18,
                spatialReference:{
                    projection:'EPSG:4326',
                    resolutions: (function () {
                        var resolutions = [];
                        for (var i = 0; i < 19; i++) {
                            resolutions[i] = 180 / (Math.pow(2, i) * 128);
                        }
                        return resolutions;
                    })()
                }
            });
            var tile = new maptalks.TileLayer('tile', {
                debug : true,
                renderer : 'canvas',
                fadeAnimation : false,
                tileSystem : [1, -1, -180, 90],
                crossOrigin:'Anonymous',
                urlTemplate:'#',
                subdomains:['1', '2', '3', '4', '5']
            });
            tile.on('layerload', function () {
                done();
            });
            map.setBaseLayer(tile);
        });

        it('baidu', function (done) {
            createMap();
            map.config({
                minZoom: 1,
                maxZoom: 19,
                spatialReference: {
                    projection : 'baidu'
                }
            });
            var tile = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                debug : true,
                fadeAnimation : false,
                crossOrigin:'Anonymous',
                urlTemplate:'#',
                subdomains:[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            });
            tile.on('layerload', function () {
                done();
            });
            map.setBaseLayer(tile);
        });
    });

    describe('Different Renderers', function () {
        it('canvas', function (done) {
            createMap();
            var tile = new maptalks.TileLayer('tile', {
                renderer : 'canvas',
                debug : true,
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c']
            });
            tile.once('layerload', function () {
                tile.hide();
                tile.show();
                done();
            });
            map.setBaseLayer(tile);

        });

        it('gl', function (done) {
            if (!maptalks.Browser.webgl) {
                done();
                return;
            }
            createMap();
            var tile = new maptalks.TileLayer('tile', {
                debug : true,
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c'],
                renderer : 'gl'
            });
            tile.once('layerload', function () {
                tile.hide();
                tile.show();
                done();
            });
            map.setBaseLayer(tile);

        });

    });

    describe('In a canvas container', function () {
        it('can be loaded', function (done) {
            container = document.createElement('canvas');
            container.style.width = '1px';
            container.style.height = '1px';
            document.body.appendChild(container);
            var option = {
                zoom: 17,
                center: center
            };
            map = new maptalks.Map(container, option);
            var tile = new maptalks.TileLayer('tile', {
                debug : true,
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c'],
                renderer : 'canvas'
            });
            tile.on('layerload', function () {
                expect(tile.isCanvasRender()).to.be.ok();
                expect(map).to.be.painted();
                done();
            });
            map.setBaseLayer(tile);
        });

        it('with rotation', function (done) {
            container = document.createElement('canvas');
            container.style.width = '1px';
            container.style.height = '1px';
            document.body.appendChild(container);
            var option = {
                zoom: 17,
                center: center,
                bearing : 50
            };
            map = new maptalks.Map(container, option);
            var tile = new maptalks.TileLayer('tile', {
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c'],
                renderer : 'canvas'
            });
            tile.on('layerload', function () {
                expect(tile.isCanvasRender()).to.be.ok();
                expect(map).to.be.painted();
                done();
            });
            map.setBaseLayer(tile);
        });

    });

    /*
    // this test is abandoned
    it('update tile view points when map center is the same but container offset changes.', function (done) {
        var tile = new maptalks.TileLayer('tile', {
            urlTemplate : '/resources/tile.png',
            subdomains:['a', 'b', 'c']
        });
        var count = 0;
        var tileId, tilePos;
        tile.on('layerload', function () {
            var renderer = tile._getRenderer();
            if (count === 0) {
                map.on('moveend', function () {
                    // map center is set to [0, 0]
                    // but container offset will be changed in the next frame
                    renderer.render();
                    tileId = renderer._preCenterId;
                    tilePos = renderer._tiles[tileId]['viewPoint'].copy();
                });
                map.setCenter([0, 0]);
            } else if (count === 2) {
                // container offset was changed
                // existing tiles' positions should be updated.
                expect(renderer._tiles[tileId]['viewPoint'].equals(tilePos)).not.to.be.ok();
                done();
            }
            count++;
        });
        map.setBaseLayer(tile);
    });*/
    describe('pitch', function () {
        it('should set pitch', function (done) {
            if (!maptalks.Browser.webgl) {
                done();
                return;
            }
            container = document.createElement('div');
            container.style.width = '10px';
            container.style.height = '10px';
            document.body.appendChild(container);
            var baselayer = new maptalks.TileLayer('tile', {
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c'],
                renderer : 'gl',
                fadeAnimation : false
            });
            baselayer.once('layerload', function () {
                baselayer.once('layerload', function () {
                    expect(baselayer.isCanvasRender()).to.be.ok();
                    done();
                });
                var map = baselayer.getMap();
                map.config('zoomDuration', 80);
                map.setZoom(map.getZoom() - 1, { animation : false });
            });
            var options = {
                zoom: 17,
                pitch : 30,
                center: center,
                baseLayer : baselayer
            };
            map = new maptalks.Map(container, options);
        });

        // dom renderer is no more used, 2017-09-21, v0.30
        /* it('should set domCssMatrix when pitch', function (done) {
            // var cmap;
            container = document.createElement('div');
            container.style.width = '10px';
            container.style.height = '10px';
            document.body.appendChild(container);
            var tile = new maptalks.TileLayer('tile', {
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c']
            });
            var tile2 = new maptalks.TileLayer('tile2', {
                urlTemplate : '/resources/tile.png',
                subdomains:['a', 'b', 'c'],
                renderer : 'dom'
            });
            // fired by tile.load()
            tile.once('layerload', function () {
                // fired by mapRenderer.drawLayer when map state changed(first render)
                tile.once('layerload', function () {
                    expect(tile.isCanvasRender()).not.to.be.ok();
                    var container = tile._getRenderer()._getTileContainer(map.getZoom());
                    var container2 = tile2._getRenderer()._getTileContainer(map.getZoom());
                    var cssMat = container.style.cssText;
                    var cssMat2 = container2.style.cssText;
                    expect(cssMat.indexOf('matrix3d') === -1).to.be.ok();
                    expect(cssMat2.indexOf('matrix3d') === -1).to.be.ok();
                    tile.on('layerload', function () {
                        cssMat = container.style.cssText;
                        cssMat2 = container2.style.cssText;
                        expect(cssMat.indexOf('matrix3d') > 0).to.be.ok();
                        expect(cssMat2.indexOf('matrix3d') > 0).to.be.ok();
                        done();
                    });
                    tile.getMap().setPitch(40);
                });
            });
            var option = {
                zoom: 17,
                center: center,
                baseLayer : tile
            };
            map = new maptalks.Map(container, option);
            map.addLayer(tile2);
        }); */
    });

});
