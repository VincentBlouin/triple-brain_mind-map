/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer",
    "diff_match_patch"
], function (GraphDisplayer) {
    "use strict";
    var api = {};
    api.withOtherGraph = function (otherGraph) {
        return new GraphCompare(
            otherGraph
        );
    };

    function GraphCompare(otherGraph) {
        this.otherGraph = otherGraph;
    }

    GraphCompare.prototype.show = function () {
        var self = this;
        GraphDisplayer.getVertexSelector().visitAllVertices(function (vertexUi) {
            if (vertexUi.hasIdentifications()) {
                var identification = vertexUi.getIdentifications()[0];
                var related = self.otherGraph.getVertexRelatedToIdentification(
                    identification
                );
                if (related) {
                    self.compareLabel(vertexUi, related);
                }
            }
        });
        GraphDisplayer.getEdgeSelector().visitAllEdges(function (edgeUi) {
            if (edgeUi.hasIdentifications()) {
                var identification = edgeUi.getIdentifications()[0];
                var related = self.otherGraph.getEdgeRelatedToIdentification(
                    identification
                );
                if (related) {
                    self.compareLabel(edgeUi, related);
                }
            }
        });
    };
    GraphCompare.prototype.compareLabel = function (originalUi, compared) {
        originalUi.setComparedWith(
            compared
        );
        originalUi.refreshComparison();
    };
    return api;
});