define(
    [
        "jquery",
        "triple_brain.user",
        "triple_brain.event_bus",
        "triple_brain.login_handler",
        "triple_brain.mind-map_template",
        "triple_brain.server_subscriber",
        "triple_brain.ui.search",
        "triple_brain.graph_displayer",
        "triple_brain.graph_displayer_factory",
        "triple_brain.menu",
        "triple_brain.ui.graph",
        "triple_brain.language_manager",
        "triple_brain.vertex",
        "triple_brain.top_center_menu",
        "triple_brain.ui.left_panel",
        "triple_brain.selection_handler",
        "triple_brain.keyboard_utils",
        "triple_brain.graph_element_main_menu",
        "triple_brain.vertex_server_facade",
        "triple_brain.bubble_distance_calculator",
        "triple_brain.freebase",
        "jquery.triple_brain.drag_scroll"
    ],
    function ($, UserService, EventBus, LoginHandler, MindMapTemplate, ServerSubscriber, SearchUi, GraphDisplayer, GraphDisplayerFactory, Menu, GraphUi, LanguageManager, VertexService, TopCenterMenu, LeftPanel, SelectionHandler, KeyboardUtils, GraphElementMainMenu, VertexServeFacade) {
        "use strict";
        var leftPanelWidth = 225,
        api = {
            offset:function () {
                var offset = {};
                var leftMargin = 150;
                var topMargin = 75;
                offset.left = leftPanelWidth + leftMargin;
                offset.top = topMargin;
                return offset;
            },
            start:function () {
                ServerSubscriber.init(function () {
                    console.log("cometd initialized");
                });
                UserService.isAuthenticated(
                    callBackWhenIsAuthenticated,
                    showCredentialsFlow
                );
                function callBackWhenIsAuthenticated() {
                    handleIfNotAuthenticatedShowCredentialsFlow();
                    handleDisconnectButton();
                    handleCreateNewConceptButton();
                    TopCenterMenu.init();
                    LeftPanel.init();
                    SearchUi.init();
                    GraphDisplayer.setImplementation(
                        GraphDisplayerFactory.getByName(
                            "relative_tree"
                        )
                    );
                    GraphElementMainMenu.reset();
                    UserService.authenticatedUser(function () {
                            LanguageManager.loadLocaleContent(function () {
                                GraphUi.resetDrawingCanvas();
                                $("body").removeClass("hidden");
                                GraphDisplayer.displayUsingDefaultVertex();
                                Menu.redrawButton().on(
                                    "click",
                                    function () {
                                        GraphUi.resetDrawingCanvas();
                                        GraphDisplayer.displayUsingNewCentralVertex(
                                            GraphDisplayer.getVertexSelector().centralVertex()
                                        );
                                });
                                translateText();
                            });
                        }
                    );
                }
                function translateText() {
                    $("html").i18n();
                }

                function handleIfNotAuthenticatedShowCredentialsFlow() {
                    $("html").ajaxError(function (e, jqxhr) {
                        if (403 === jqxhr.status) {
                            showCredentialsFlow();
                        }
                    });
                }

                function showCredentialsFlow() {
                    $("body").removeClass("hidden");
                    LanguageManager.loadLocaleContent(function () {
                        LoginHandler.startFlow();
                    });
                }

                function handleDisconnectButton() {
                    $("#disconnect-btn").click(function () {
                        UserService.logout(function () {
                            window.location = "/";
                        });
                    });
                }

                function handleCreateNewConceptButton() {
                    $("#create-concept").on(
                        "click",
                        function () {
                            VertexService.createVertex(function(newVertex){
                                var serverFormatFacade = VertexServeFacade.fromServerFormat(
                                    newVertex
                                );
                                GraphDisplayer.displayUsingNewCentralVertexUri(
                                    serverFormatFacade.getUri()
                                );
                            });
                        }
                    );
                }
            }
        };
        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexUri) {
                SelectionHandler.setToNoneSelected();
                var centralVertex = GraphDisplayer.getVertexSelector().withUri(centralVertexUri)[0];
                centralVertex.setAsCentral();
                GraphDisplayer.integrateEdgesOfServerGraph(
                    drawnGraph
                );
                centralVertex.scrollTo();
                $("svg.main").dragScroll().on(
                    "click",
                    function(){
                        if(KeyboardUtils.isCtrlPressed()){
                            return;
                        }
                        SelectionHandler.setToNoneSelected();
                    }
                );
                GraphDisplayer.getVertexSelector().visitAllVertices(function(vertex){
                    EventBus.publish(
                        '/event/ui/vertex/visit_after_graph_drawn',
                        vertex
                    );
                });
                EventBus.publish('/event/ui/graph/drawn');
            }
        );
        return api;
    }
);


