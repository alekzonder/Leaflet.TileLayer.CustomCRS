// customize L.Map

L.Map.prototype.project = function(latlng, zoom, crs) { // (LatLng[, Number][, L.CRS]) -> Point
    crs = !crs ? this.options.crs : crs;
    zoom = zoom === undefined ? this._zoom : zoom;
    return crs.latLngToPoint(L.latLng(latlng), zoom);
};

L.Map.prototype.unproject = function(point, zoom, crs) { // (Point[, Number][,L.CRS]) -> LatLng
    crs = !crs ? this.options.crs : crs;
    zoom = zoom === undefined ? this._zoom : zoom;
    return crs.pointToLatLng(L.point(point), zoom);
};

L.Map.prototype._getNewPixelOrigin = function(center, zoom, crs) {
    var viewHalf = this.getSize()._divideBy(2);
    return this.project(center, zoom, crs)._subtract(viewHalf)._add(this._getMapPanePos())._round();
};

L.TileLayerCustomCRS = L.TileLayer.extend({
    _updateLevels: function() {

        var zoom = this._tileZoom,
        maxZoom = this.options.maxZoom;

        if (zoom === undefined) {
            return undefined;
        }

        for (var z in this._levels) {
            if (this._levels[z].el.children.length || z === zoom) {
                this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z);
            } else {
                L.DomUtil.remove(this._levels[z].el);
                if (this._removeTilesAtZoom) {
                    this._removeTilesAtZoom(z);
                }

                delete this._levels[z];
            }
        }

        var level = this._levels[zoom],
        map = this._map;

        if (!level) {
            level = this._levels[zoom] = {};

            level.el = L.DomUtil.create('div', 'leaflet-tile-container leaflet-zoom-animated', this._container);
            level.el.style.zIndex = maxZoom;

            level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom).round();

            // custom
            // calculate crs level for custom crs
            //
            level.__customCrsLevel = {};

            var a = map._getNewPixelOrigin(
                map.getCenter(),
                undefined,
                this.options.crs
            );

            var b = map.unproject(
                a,
                undefined,
                this.options.crs
            );

            level.__customCrsLevel.origin = map.project(
                b,
                zoom,
                this.options.crs
            ).round();

            // end of custom

            level.zoom = zoom;

            this._setZoomTransform(level, map.getCenter(), map.getZoom());

            // force the browser to consider the newly added element for transition
            L.Util.falseFn(level.el.offsetWidth);
        }

        this._level = level;

        // custom
        this.__customCrsLevel = level.__customCrsLevel;
        // end of custom

        return level;
    },


    _getTiledPixelBounds: function(center) {

        var map = this._map;

        var crs = (this._hasDifferentCrs) ? this.options.crs : null;

        // custom (add this.options.crs in project method call)
        var pixelCenter = map.project(center, this._tileZoom, crs).floor();
        // end of custom

        var halfSize = map.getSize().divideBy(2);

        return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
    },

    _getTilePos: function(coords) {

        // custom
        if (this._hasDifferentCrs()) {
            return coords.scaleBy(this.getTileSize()).subtract(this.__customCrsLevel.origin);
        } else {
            return coords.scaleBy(this.getTileSize()).subtract(this._level.origin);
        }
        // end of custom
    },


    _hasDifferentCrs() {
        return this.options.crs && this._map.options.crs != this.options.crs;
    }
});
