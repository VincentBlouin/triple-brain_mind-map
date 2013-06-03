/*
 * Copyright Mozilla Public License 1.1
 */
define([
    "jquery",
    "triple_brain.graph",
    "triple_brain.graph_displayer_as_tree_common",
    "triple_brain.vertex_html_builder_for_tree_displayer",
    "triple_brain.ui.graph",
    "triple_brain.relative_tree_displayer_templates",
    "triple_brain.ui.edge",
    "triple_brain.event_bus",
    "triple_brain.ui.vertex",
    "triple_brain.ui.arrow_line",
    "triple_brain.id_uri",
    "triple_brain.relative_vertex",
    "triple_brain.edge_html_builder_for_relative_tree"
], function ($, Graph, TreeDisplayerCommon, VertexHtmlBuilder, GraphUi, RelativeTreeTemplates, EdgeUi, EventBus, VertexUi, ArrowLine, IdUriUtils, RelativeVertex, EdgeBuilder) {
    var api = {};
    api.displayUsingDepthAndCentralVertexUri = function (centralVertexUri, depth, callback) {
        Graph.getForCentralVertexUriAndDepth(centralVertexUri, depth, function (graph) {
            var drawnTree = new TreeMaker()
                .makeUsingServerGraphAndCentralVertexUri(
                graph,
                centralVertexUri
            );
            callback(drawnTree);
        });
    };
    api.name = function(){
        return "relative_tree";
    };
    api.addVertex = function (newVertex, parentVertex) {
        var treeMaker = new TreeMaker();
        var container;
        if (parentVertex.isCenterVertex()) {
            container = shouldAddLeft() ?
                leftVerticesContainer() :
                rightVerticesContainer();
        } else {
            container = treeMaker.childrenVertexContainer(parentVertex);
        }
        newVertex.neighbors = [];
        var vertexHtmlFacade = treeMaker.buildVertexHtmlIntoContainer(
            newVertex,
            container
        );
        var relativeVertex = RelativeVertex.withVertex(vertexHtmlFacade);
        if (relativeVertex.isToTheLeft()) {
            relativeVertex.adjustPosition(parentVertex.getHtml());
        }
        EdgeUi.redrawAllEdges();
        return vertexHtmlFacade;
    };
    api.allowsMovingVertices = function () {
        return false;
    };
    api.integrateEdges = function (edges) {
        VertexUi.visitAllVertices(integrateEdgesOfVertex);
        function integrateEdgesOfVertex(vertex) {
            var vertexServerFormat = vertex.getOriginalServerObject();
            $.each(vertexServerFormat.neighbors, function () {
                var childInfo = this;
                if(childInfo[vertex.getId()] === undefined){
                    return;
                }
                EdgeBuilder.get(
                    childInfo.edge,
                    vertex,
                    VertexUi.withId(childInfo[vertex.getId()].vertexHtmlId)
                ).create();
            });
        }
    };
    api.addEdge = function (serverEdge, sourceVertex, destinationVertex) {
        return EdgeBuilder.get(
            serverEdge,
            sourceVertex,
            destinationVertex
        ).create();
    };
    return api;
    function shouldAddLeft() {
        var numberOfDirectChildrenLeft = $(leftVerticesContainer()).children().length;
        var numberOfDirectChildrenRight = $(rightVerticesContainer()).children().length;
        return  numberOfDirectChildrenLeft < numberOfDirectChildrenRight;
    }

    function leftVerticesContainer() {
        return $(
            ".vertices-children-container.left-oriented"
        );
    }

    function rightVerticesContainer() {
        return $(".center-vertex").closest(".vertex-container").siblings(
            ".vertices-children-container:not(.left-oriented):first"
        );
    }

    function TreeMaker() {
        var treeMaker = this;
        this.makeUsingServerGraphAndCentralVertexUri = function (serverGraph, centralVertexUri) {
            var vertices = serverGraph.vertices;
            TreeDisplayerCommon.defineChildrenInVertices(
                serverGraph,
                centralVertexUri
            );
            buildVerticesHtml();
            $.each($(".left-oriented .vertex"), function(){
                var relativeVertex = RelativeVertex.withVertexHtml(this);
                relativeVertex.adjustPosition();
            });
            function buildVerticesHtml() {
                var serverRootVertex = vertexWithId(centralVertexUri);
                serverRootVertex.added = true;
                var rootVertex = VertexHtmlBuilder.withServerJson(
                    serverRootVertex
                ).create();
                var graphOffset = GraphUi.offset();
                var verticesContainer = RelativeTreeTemplates[
                    "root_vertex_super_container"
                    ].merge({
                        offset:graphOffset
                    });
                GraphUi.addHTML(
                    verticesContainer
                );
                var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
                $(verticesContainer).append(vertexContainer);
                $(vertexContainer).append(rootVertex.getHtml());
                rootVertex.adjustWidth();
                var leftChildrenContainer = treeMaker.addChildrenContainerToVertex(
                    rootVertex
                );
                $(leftChildrenContainer).addClass("left-oriented");
                var rightChildrenContainer = treeMaker.addChildrenContainerToVertex(
                    rootVertex
                );
                for (var i = 0; i < serverRootVertex.neighbors.length; i++) {
                    var isLeftOriented = i % 2 != 0;
                    var childVertex = vertexWithId(serverRootVertex.neighbors[i].vertexUri);
                    childVertex.added = true;
                    var container = isLeftOriented ?
                        leftChildrenContainer :
                        rightChildrenContainer;
                    var childHtmlFacade = treeMaker.buildVertexHtmlIntoContainer(
                        childVertex,
                        container
                    );
                    serverRootVertex.neighbors[i][rootVertex.getId()] = {
                        vertexHtmlId : childHtmlFacade.getId()
                    };
                    buildChildrenHtmlTreeRecursively(
                        childHtmlFacade,
                        serverRootVertex.id
                    );
                }
                function buildChildrenHtmlTreeRecursively(parentVertexHtmlFacade, grandParentUri) {
                    var serverParentVertex = vertexWithId(
                        parentVertexHtmlFacade.getUri()
                    );
                    var childrenContainer = treeMaker.childrenVertexContainer(parentVertexHtmlFacade);
                    $.each(serverParentVertex.neighbors, function () {
                        var childInfo = this;
                        if(grandParentUri === childInfo.vertexUri){
                            return;
                        }
                        var childVertexHtmlFacade = treeMaker.buildVertexHtmlIntoContainer(
                            vertexWithId(childInfo.vertexUri),
                            childrenContainer
                        );
                        childInfo[parentVertexHtmlFacade.getId()] = {
                            vertexHtmlId : childVertexHtmlFacade.getId()
                        };
                        var treeContainer = childVertexHtmlFacade.getHtml().closest(
                            ".vertex-tree-container"
                        );
                        if(childInfo.added === undefined){
                            childInfo.added = true;
                        }else{
                            $(treeContainer).append(
                                buildChildrenHtmlTreeRecursively(
                                    childVertexHtmlFacade,
                                    parentVertexHtmlFacade.getUri()
                                )
                            );
                        }
                    });
                    return childrenContainer;
                }
            }

            return serverGraph;
            function vertexWithId(vertexId) {
                return vertices[vertexId]
            }
        };

        this.buildVertexHtmlIntoContainer = function (vertex, container) {
            var childVertexHtmlFacade = VertexHtmlBuilder.withServerJson(
                vertex
            ).create();
            var childTreeContainer = RelativeTreeTemplates[
                "vertex_tree_container"
                ].merge();
            $(container).append(
                childTreeContainer
            );
            var vertexContainer = RelativeTreeTemplates["vertex_container"].merge();
            childTreeContainer.append(
                vertexContainer
            );
            vertexContainer.append(
                childVertexHtmlFacade.getHtml()
            );
            childVertexHtmlFacade.adjustWidth();
            treeMaker.addChildrenContainerToVertex(childVertexHtmlFacade);
            return childVertexHtmlFacade;
        };
        this.addChildrenContainerToVertex = function (vertexHtmlFacade) {
            var childrenContainer = RelativeTreeTemplates[
                "vertices_children_container"
                ].merge();
            vertexHtmlFacade.getHtml().closest(
                ".vertex-tree-container, .root-vertex-super-container"
            ).append(childrenContainer);
            return childrenContainer;
        };
        this.childrenVertexContainer = function (vertexHtmlFacade) {
            return $(vertexHtmlFacade.getHtml()).closest(".vertex-container"
            ).siblings(".vertices-children-container");
        }
    }
});