/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    "jquery",
    "triple_brain.selection_handler"
],
    function ($, SelectionHandler) {
        "use strict";
        var api = {},
            topCenterMenu,
            buttons,
            selectionButton;
        api.init = function () {
            getButtons().button();
            getSelectionButton().on(
                "click",
                SelectionHandler.handleButtonClick
            );
        };
        return api;
        function getSelectionButton() {
            if(!selectionButton){
                selectionButton = getButtons().filter(".select");
            }
            return selectionButton;
        }

        function getButtons() {
            if(!buttons){
                buttons = getTopCenterMenu().find(".buttons").find(
                    "button"
                );
            }
            return buttons;
        }

        function getTopCenterMenu() {
            if(!topCenterMenu){
                topCenterMenu = $("#top-center-menu");
            }
            return topCenterMenu;
        }
    }
);
