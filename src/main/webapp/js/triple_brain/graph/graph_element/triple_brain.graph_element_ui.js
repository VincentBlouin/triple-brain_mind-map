/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "triple_brain.graph_displayer",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_element_type",
    "triple_brain.event_bus",
    "jquery.focus-end",
    "jquery.center-on-screen"
], function (GraphDisplayer, GraphElementMainMenu, GraphElementType, EventBus) {
    var api = {},
        otherInstancesKey = "otherInstances",
        textBeforeModificationKey = "textBeforeModification";
    api.Types = GraphElementType;
    var menuHandlerGetters = {},
        selectors = {};
    initMenuHandlerGetters();
    initSelectors();
    api.buildCommonConstructors = function (api) {
        var cacheWithIdAsKey = {},
            cacheWithUriAsKey = {};
        api.initCache = function (graphElement) {
            cacheWithIdAsKey[graphElement.getId()] = graphElement;
            updateUriCache(graphElement.getUri(), graphElement);
        };
        api.withHtml = function (html) {
            return cacheWithIdAsKey[
                html.prop('id')
                ];
        };
        api.withId = function (id) {
            return cacheWithIdAsKey[id];
        };
        api.withUri = function (uri) {
            return cacheWithUriAsKey[uri];
        };
        api.lastAddedWithUri = function (uri) {
            return cacheWithUriAsKey[uri][
            cacheWithUriAsKey[uri].length - 1
                ];
        };
        api.visitAll = function (visitor) {
            $.each(cacheWithIdAsKey, function () {
                visitor(this);
            });
        };
        api.removeFromCache = function (uri, id) {
            var len = cacheWithUriAsKey[uri].length;
            while (len--) {
                var vertex = cacheWithUriAsKey[uri][len];
                if (vertex.getId() === uri) {
                    cacheWithUriAsKey.splice(len, 1);
                }
            }
            delete cacheWithIdAsKey[id];
        };
        EventBus.subscribe('/event/ui/graph/reset', emptyCache);
        function emptyCache() {
            cacheWithIdAsKey = {};
            cacheWithUriAsKey = {};
        }

        function updateUriCache(uri, vertex) {
            if (undefined === cacheWithUriAsKey[uri]) {
                cacheWithUriAsKey[uri] = [];
            }
            cacheWithUriAsKey[uri].push(vertex);
        }
    };
    api.Self = function () {
    };
    api.Self.prototype.setOriginalServerObject = function (serverJson) {
        this.html.data(
            "originalServerObject",
            serverJson
        );
    };
    api.Self.prototype.getOriginalServerObject = function () {
        return this.html.data(
            "originalServerObject"
        );
    };
    api.Self.prototype.getId = function () {
        return this.getHtml().attr("id");
    };
    api.Self.prototype.hasTheDuplicateButton = function () {
        return this.getInBubbleContainer().find(
                "button.duplicate"
            ).length > 0;
    };

    api.Self.prototype.getOtherInstances = function () {
        if (this.html.data(otherInstancesKey) === undefined) {
            this._defineSameInstances();
        }
        return this.html.data(otherInstancesKey);
    };

    api.Self.prototype._defineSameInstances = function () {
        var elementsWithSameUri = this.getSelector().withUri(
            this.getUri()
        );
        var otherInstances = [],
            self = this;
        $.each(elementsWithSameUri, function () {
            var elementWithSameUri = this;
            if (elementWithSameUri.getId() === self.getId()) {
                return;
            }
            otherInstances.push(
                elementWithSameUri
            );
        });
        this.html.data(
            otherInstancesKey,
            otherInstances
        );
    };
    api.Self.prototype.applyToOtherInstances = function (apply) {
        $.each(this.getOtherInstances(), function () {
            var element = this;
            apply(element);
        });
    };

    api.Self.prototype.resetOtherInstances = function () {
        this.html.removeData(otherInstancesKey);
    };
    api.Self.prototype.isVertex = function () {
        return this.getGraphElementType() === api.Types.Vertex;
    };
    api.Self.prototype.isCenterBubble = function () {
        return this.html.hasClass("center-vertex");
    };
    api.Self.prototype.isSchema = function () {
        return this.getGraphElementType() === api.Types.Schema;
    };
    api.Self.prototype.isRelation = function () {
        return this.getGraphElementType() === api.Types.Relation;
    };
    api.Self.prototype.isGroupRelation = function () {
        return this.getGraphElementType() === api.Types.GroupRelation;
    };
    api.Self.prototype.isProperty = function () {
        return this.getGraphElementType() === api.Types.Property;
    };
    api.Self.prototype.isVertexSuggestion = function () {
        return this.getGraphElementType() === api.Types.VertexSuggestion;
    };
    api.Self.prototype.isRelationSuggestion = function () {
        return this.getGraphElementType() === api.Types.RelationSuggestion;
    };
    api.Self.prototype.isInTheRelationFamily = function () {
        return this.getHtml().hasClass("relation");
    };
    api.Self.prototype.getSimilarButtonHtml = function (button) {
        return this.getMenuHtml().find(
            "[data-action=" + button.getAction() + "]"
        );
    };
    api.Self.prototype.getMenuHandler = function () {
        return menuHandlerGetters[
            this.getGraphElementType()
            ]();
    };
    api.Self.prototype.getTextOrDefault = function () {
        var text = this.text();
        return "" === text.trim() ?
            this.getSelector().getWhenEmptyLabel() :
            text;
    };
    api.Self.prototype.getSelector = function () {
        return selectors[
            this.getGraphElementType()
            ]();
    };

    api.Self.prototype.rightActionForType = function (vertexAction, edgeAction, groupRelationAction, schemaAction, propertyAction, suggestionVertexAction, suggestionRelationAction) {
        switch (this.getGraphElementType()) {
            case api.Types.Vertex :
                return vertexAction;
            case api.Types.Relation :
                return edgeAction;
            case api.Types.GroupRelation :
                return groupRelationAction;
            case api.Types.Schema :
                return schemaAction;
            case api.Types.Property :
                return propertyAction;
            case api.Types.VertexSuggestion :
                return suggestionVertexAction;
            case api.Types.RelationSuggestion :
                return suggestionRelationAction;
        }
    };
    api.Self.prototype.focus = function () {
        this.getHtml().centerOnScreen();
        this.editMode();
        this._setTextBeforeModification();
        this.getLabel().maxCharCleanTextApply().focusEnd();
    };
    api.Self.prototype._setTextBeforeModification = function(){
        this.getHtml().data(
            textBeforeModificationKey, this.text()
        );
    };
    api.Self.prototype.hasTextChangedAfterModification = function(){
        return this.getHtml().data(
            textBeforeModificationKey
        ) !== this.text();
    };
    api.Self.prototype.editMode = function () {
        this.getLabel().attr(
            "contenteditable",
            "true"
        );
        this.getHtml().addClass("edit");
    };
    api.Self.prototype.centerOnScreen = function () {
        this.getHtml().centerOnScreen();
    };
    api.Self.prototype.isInTypes = function (types) {
        return $.inArray(
                this.getGraphElementType(),
                types
            ) !== -1;
    };
    api.Self.prototype.getHtml = function () {
        return this.html;
    };
    api.Self.prototype.rebuildMenuButtons = function () {
        var container = this.getMenuHtml().empty();
        GraphElementMainMenu.addRelevantButtonsInMenu(
            container,
            this.getMenuHandler().forSingle()
        );
        this.onlyShowButtonsIfApplicable();
    };
    api.Self.prototype.onlyShowButtonsIfApplicable = function () {
        GraphElementMainMenu.onlyShowButtonsIfApplicable(
            this.getMenuHandler().forSingle(),
            this
        );
    };
    api.Self.prototype.isSuggestion = function () {
        return this.isVertexSuggestion() || this.isRelationSuggestion();
    };
    api.Self.prototype.setUri = function (uri) {
        this.html.data(
            "uri",
            uri
        );
    };
    api.Self.prototype.getUri = function () {
        return this.html.data(
            "uri"
        );
    };
    api.Self.prototype.setNote = function (note) {
        this.html.data("note", note);
    };
    api.Self.prototype.getNote = function () {
        return this.html.data("note");
    };
    api.Self.prototype.hasNote = function () {
        return this.getNote().trim().length > 0;
    };
    api.Self.prototype.getNoteButtonInBubbleContent = function () {
        return this.getHtml().find(
            ".in-bubble-note-button"
        );
    };
    api.Self.prototype.getNoteButtonInMenu = function () {
        return this.getMenuHtml().find("> .note-button");
    };
    EventBus.subscribe(
        '/event/ui/graph/identification/added',
        identificationAddedHandler
    );
    function identificationAddedHandler(event, graphElement, identification) {
        graphElement.applyToOtherInstances(function (vertex) {
            var addAction = identification.rightActionForType(
                graphElement.addType,
                graphElement.addSameAs,
                graphElement.addGenericIdentification
            );
            addAction.call(
                vertex,
                identification
            );
        });
    }

    EventBus.subscribe(
        '/event/ui/graph/identification/removed',
        identificationRemovedHandler
    );
    function identificationRemovedHandler(event, graphElement, identification) {
        graphElement.applyToOtherInstances(function (vertex) {
            var removeAction = identification.rightActionForType(
                graphElement.removeType,
                graphElement.removeSameAs,
                graphElement.removeGenericIdentification
            );
            removeAction.call(
                vertex,
                identification
            );
        });
    }

    return api;
    function initMenuHandlerGetters() {
        menuHandlerGetters[api.Types.Vertex] = GraphDisplayer.getVertexMenuHandler;
        menuHandlerGetters[api.Types.Relation] = GraphDisplayer.getRelationMenuHandler;
        menuHandlerGetters[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationMenuHandler;
        menuHandlerGetters[api.Types.Schema] = GraphDisplayer.getSchemaMenuHandler;
        menuHandlerGetters[api.Types.Property] = GraphDisplayer.getPropertyMenuHandler;
        menuHandlerGetters[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionMenuHandler;
        menuHandlerGetters[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionMenuHandler;
    }

    function initSelectors() {
        selectors[api.Types.Vertex] = GraphDisplayer.getVertexSelector;
        selectors[api.Types.Relation] = GraphDisplayer.getEdgeSelector;
        selectors[api.Types.GroupRelation] = GraphDisplayer.getGroupRelationSelector;
        selectors[api.Types.Schema] = GraphDisplayer.getSchemaSelector;
        selectors[api.Types.Property] = GraphDisplayer.getPropertySelector;
        selectors[api.Types.VertexSuggestion] = GraphDisplayer.getVertexSuggestionSelector;
        selectors[api.Types.RelationSuggestion] = GraphDisplayer.getRelationSuggestionSelector;
    }
});
