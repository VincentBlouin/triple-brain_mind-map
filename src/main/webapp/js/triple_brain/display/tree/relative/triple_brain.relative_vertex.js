/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.tree_vertex",
    "triple_brain.ui.edge",
    "triple_brain.event_bus"
], function ($, TreeVertex, EdgeUi, EventBus) {
    var api = {};
    api.withVertex = function (vertex) {
        return new RelativeVertex(vertex.getHtml());
    };
    api.withVertexHtml = function (vertexHtml) {
        return new RelativeVertex(vertexHtml);
    };
    EventBus.subscribe(
        "/event/ui/graph/vertex/image/updated",
        function(event, vertex){
            var relativeVertex = api.withVertex(vertex);
            api.withVertexHtml(
                relativeVertex.getParentVertexHtml()
            ).adjustAllChildrenPositionIfApplicable();
            EdgeUi.redrawAllEdges();
        }
    );
    return api;
    function RelativeVertex(html) {
        html = $(html);
        var _isToTheLeft;
        var thisRelativeVertex = this;
        this.isToTheLeft = function () {
            if (_isToTheLeft === undefined) {
                _isToTheLeft = html.parents(".left-oriented").length > 0;
            }
            return _isToTheLeft;
        };
        this.adjustPositionIfApplicable = function () {
            if (thisRelativeVertex.isToTheLeft()) {
                thisRelativeVertex.adjustPosition();
            }
        };
        this.adjustAllChildrenPositionIfApplicable = function () {
            var vertex = TreeVertex.withHtml(html);
            if (thisRelativeVertex.isToTheLeft() || vertex.isCenterVertex()) {
                var visit = vertex.isCenterVertex() ?
                    thisRelativeVertex.visitCenterVertexLeftVertices :
                    thisRelativeVertex.visitChildren;
                visit(function (vertex) {
                    var relativeVertex = api.withVertex(vertex);
                    relativeVertex.adjustPosition();
                });
            }
        };
        this.adjustPosition = function (parentVertexHtml) {
            var width = html.width();
            var vertex = TreeVertex.withHtml(html);
            if (parentVertexHtml === undefined) {
                parentVertexHtml = thisRelativeVertex.getParentVertexHtml();
            }
            var parentWidth = $(parentVertexHtml).width();
            html.closest(".vertex-tree-container").css(
                "margin-left", "-" + (parentWidth + width + 40) + "px"
            );
            EventBus.publish(
                "/event/ui/graph/vertex/position-changed",
                vertex
            );
        };
        this.visitChildren = function (visitor) {
            var children = html.closest(".vertex-container").siblings(
                ".vertices-children-container"
            ).find(".vertex");
            $.each(children, function () {
                var vertex = TreeVertex.withHtml(this);
                visitor(vertex);
            });
        };
        this.visitCenterVertexLeftVertices = function (visitor) {
            var children = html.closest(".vertex-container").siblings(
                ".vertices-children-container.left-oriented"
            ).find(".vertex");
            $.each(children, function () {
                var vertex = TreeVertex.withHtml(this);
                visitor(vertex);
            });
        };
        this.getParentVertexHtml = function(){
            return html.closest(".vertices-children-container")
                .siblings(".vertex-container");
        };
    }
});