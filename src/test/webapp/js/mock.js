/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */

define([
    'test/webapp/js/test-utils',
    "triple_brain.user_service",
    "triple_brain.mind_map_info",
    "triple_brain.suggestion_service",
    "triple_brain.graph_service",
    "triple_brain.schema_service",
    "triple_brain.vertex_service",
    "triple_brain.friendly_resource_service",
    "triple_brain.search"
], function (TestUtils, UserService, MindMapInfo, SuggestionService, GraphService, SchemaService, VertexService, FriendlyResourceService, SearchService) {
    "use strict";
    var api = {};
    api.setCenterVertexUriInUrl = function(centerVertexUri){
        MindMapInfo._getCenterVertexUriInUrl = function(){
            return centerVertexUri;
        }
    };
    api.setGetGraphFromService = function(graph){
        GraphService.getForCentralVertexUri = function(centerVertexUri, callback){
            callback(
                graph
            );
        };
    };
    api.setGetSchemaFromService = function(schema){
        SchemaService.get = function(schemaUri, callback){
            callback(
                schema
            );
        };
    };
    api.getSearchResultDetailsToReturn = function(toReturn){
        SearchService.getSearchResultDetails = function(uri, callback){
            callback(toReturn);
        };
    };
    api.mockRemoveVertex = function(){
        return spyOn(VertexService, "remove").andCallFake(function(vertex, callback){
            callback(vertex);
        });
    };
    api.mockUpdateLabel = function(){
        return spyOn(FriendlyResourceService, "updateLabel").andCallFake(function(friendlyResource, label, callback){
            if (callback !== undefined) {
                callback(friendlyResource);
            }
        });
    };
    api.mockAcceptSuggestion = function(){
        return spyOn(SuggestionService, "accept").andCallFake(function(suggestionUi, callback){
            SuggestionService.acceptCallback(
                TestUtils.generateVertexUri(),
                TestUtils.generateEdgeUri(),
                suggestionUi,
                callback
            );
        });
    };
    UserService.authenticatedUserInCache = function(){
        return {
            user_name : "foo"
        }
    };
    SuggestionService.accept = function(suggestionUi, callback){
        callback();
    };
    VertexService.addSuggestions = function(){};

    return api;
});