/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    "triple_brain.tree_edge",
    "triple_brain.graph_element_ui",
    "triple_brain.event_bus"
], function (TreeEdge, GraphElementUi, EventBus) {
    "use strict";
    var api = {};
    TreeEdge.buildCommonConstructors(api);
    api.getWhenEmptyLabel = function () {
        return "suggestion"
    };
    api.Self = function(html){
        this.html = html;
        TreeEdge.Self.apply(this);
        this.init(html);
    };
    api.Self.prototype = new TreeEdge.Self;
    api.Self.prototype.getGraphElementType = function () {
        return GraphElementUi.Types.RelationSuggestion;
    };
    api.Self.prototype.integrate = function (newRelationUri, destinationVertex) {
        api.removeFromCache(
            this.getUri(),
            this.getId()
        );
        this.setUri(
            newRelationUri
        );
        this.html.removeClass(
            "suggestion"
        ).data(
            "source_vertex_id",
            this.getParentBubble().getId()
        ).data(
            "destination_vertex_id",
            destinationVertex.getId()
        );
        this.getLabel().attr(
            "placeholder", TreeEdge.getWhenEmptyLabel()
        );
        var edge = new TreeEdge.Self().init(this.html);
        TreeEdge.initCache(
            edge
        );
        edge.rebuildMenuButtons();
        EventBus.publish(
            '/event/ui/html/edge/created/',
            edge
        );
        return edge;
    };
    return api;
});