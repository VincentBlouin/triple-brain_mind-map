/*
 * Copyright Mozilla Public License 1.1
 */

define([
    "jquery",
    "triple_brain.config",
    "triple_brain.user"
],
    function ($, config, UserService) {
        var api = {};
        api.searchForOwnVerticesAndPublicOnes = function (searchText, successCallback) {
            api.searchForOwnVerticesAndPublicOnesAjaxCall(
                searchText
            ).success(successCallback);
        };
        api.searchForOwnVerticesOnly = function (searchText, successCallback) {
            api.searchForOwnVerticesOnly(
                searchText
            ).success(successCallback);
        };
        api.searchForOnlyOwnVerticesAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/own_vertices/auto_complete/" + searchText
            });
        };
        api.searchForOwnVerticesAndPublicOnesAjaxCall = function(searchText){
            return $.ajax({
                type:'GET',
                url: UserService.currentUserUri() +
                    "/search/vertices/auto_complete/" + searchText
            });
        };
        return api;
    }
);