/*
 * Copyright Vincent Blouin under the Mozilla Public License 1.1
 */
define([
    "triple_brain.property_ui",
    "triple_brain.graph_element_html_builder",
    "triple_brain.edge_html_builder_common",
    "triple_brain.graph_element_main_menu",
    "triple_brain.graph_displayer",
    "triple_brain.event_bus"
], function (PropertyUi, GraphElementHtmlBuilder, EdgeHtmlBuilderCommon, GraphElementMainMenu, GraphDisplayer, EventBus) {
    "use strict";
    var api = {};
    api.withServerFacade = function (serverFacade) {
        return new Self(serverFacade);
    };
    api.completeBuild = function(property){
        GraphElementHtmlBuilder.moveNoteButtonIfIsToTheLeft(
            property
        );
    };
    function Self(serverFacade) {
        this.serverFacade = serverFacade;
    }

    Self.prototype.create = function () {
        this.html = $("<div class='property relation bubble graph-element'>").data(
            "uri",
            this.serverFacade.getUri()
        ).uniqueId();
        var inBubbleContentContainer = $("<div class='in-bubble-content label label-info'>").appendTo(
                this.html
            ),
            property = PropertyUi.createFromHtml(
                this.html
            );
        EdgeHtmlBuilderCommon.buildLabel(
            inBubbleContentContainer,
            this.serverFacade.getLabel(),
            PropertyUi.getWhenEmptyLabel()
        );
        property.setNote(
            this.serverFacade.getComment()
        );
        this._buildMenu(this.html).hide();
        GraphElementHtmlBuilder.addNoteButtonNextToLabel(
            property
        );
        this.html.append(
            $("<span class='arrow'>")
        );
        property.setTypes([]);
        property.setSameAs([]);
        property.setGenericIdentifications([]);
        $.each(this.serverFacade.getTypes(), function () {
            var typeFromServer = this;
            property.addType(
                typeFromServer
            );
        });
        $.each(this.serverFacade.getSameAs(), function () {
            var sameAsFromServer = this;
            property.addSameAs(
                sameAsFromServer
            );
        });
        property.refreshImages();
        return property;
    };
    Self.prototype._buildMenu = function (container) {
        var menu = $("<div class='relation-menu'>").appendTo(
            container
        );
        GraphElementMainMenu.addRelevantButtonsInMenu(
            menu,
            GraphDisplayer.getPropertyMenuHandler().forSingle()
        );
        return menu;
    };
    EventBus.subscribe('/event/ui/graph/drawn', function(){
        PropertyUi.visitAllProperties(api.completeBuild);
    });
    return api;
});
