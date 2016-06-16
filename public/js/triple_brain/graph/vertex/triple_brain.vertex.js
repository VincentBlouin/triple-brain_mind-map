/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.graph_element",
    "triple_brain.edge",
    "triple_brain.suggestion"
], function ($, GraphElement, Edge, Suggestion) {
    "use strict";
    var api = {};
    api.fromServerFormat = function (serverFormat) {
        return new Self(
            serverFormat
        );
    };
    api.buildServerFormatFromUri = function(uri){
        return {
            vertex:{
                graphElement: GraphElement.buildObjectWithUri(uri),
                includedEdges:{},
                includedVertices:{},
                isPublic:false,
                numberOfConnectedEdges:1,
                suggestions:{}
            }
        };
    };
    api.buildServerFormatFromUi = function (vertexUi) {
        return {
            vertex:{
                graphElement: GraphElement.buildServerFormatFromUi(
                    vertexUi
                ),
                includedEdges:{},
                includedVertices:{},
                isPublic:vertexUi.isPublic(),
                numberOfConnectedEdges: vertexUi.connectedEdges().length,
                suggestions:{}
            }
        };
    };
    function Self(vertexServerFormat) {
        this.vertexServerFormat = vertexServerFormat;
        this._includedVertices = this._buildIncludedVertices();
        this._includedEdges = this._buildIncludedEdges();
        this._suggestions = this._buildSuggestions();
        GraphElement.Self.apply(
            this
        );
        this.init(vertexServerFormat.vertex.graphElement);
    }

    Self.prototype = new GraphElement.Self();

    Self.prototype.getIncludedVertices = function () {
        return this._includedVertices;
    };
    Self.prototype.getIncludedEdges = function () {
        return this._includedEdges;
    };
    Self.prototype.getSuggestions = function () {
        return this._suggestions;
    };
    Self.prototype.getNumberOfConnectedEdges = function () {
        return this.vertexServerFormat.vertex.numberOfConnectedEdges;
    };

    Self.prototype.isPublic = function () {
        return this.vertexServerFormat.vertex.isPublic;
    };
    Self.prototype._buildIncludedEdges = function () {
        var includedEdges = {};
        if (this.vertexServerFormat.vertex.includedEdges === undefined) {
            return includedEdges;
        }
        $.each(this.vertexServerFormat.vertex.includedEdges, function (key, value) {
            includedEdges[key] = Edge.fromServerFormat(
                value
            );
        });
        return includedEdges;
    };

    Self.prototype._buildIncludedVertices = function () {
        var includedVertices = {};
        if (this.vertexServerFormat.vertex.includedVertices === undefined) {
            return includedVertices;
        }
        $.each(this.vertexServerFormat.vertex.includedVertices, function (key, value) {
            includedVertices[key] = api.fromServerFormat(
                value
            );
        });
        return includedVertices;
    };

    Self.prototype._buildSuggestions = function () {
        var suggestions = [];
        if (this.vertexServerFormat.vertex.suggestions === undefined) {
            return suggestions;
        }
        return Suggestion.fromServerArray(
            this.vertexServerFormat.vertex.suggestions
        );
    };
    Self.prototype.addSuggestions = function(suggestions){
        this._suggestions = this._suggestions.concat(
            suggestions
        );
    };
    return api;
});