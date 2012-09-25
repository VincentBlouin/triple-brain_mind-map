define(
    [
        "jquery",
        "triple_brain.user",
        "triple_brain.event_bus",
        "triple_brain.drag_scroll",
        "triple_brain.drawn_graph",
        "triple_brain.ui.graph",
        "triple_brain.ui.vertex",
        "triple_brain.ui.vertex_creator",
        "triple_brain.ui.edge_creator",
        "triple_brain.search",
        "triple_brain.mind-map_template",
        "jquery-ui.min"
    ],
    function($, UserService, EventBus, DragScroll, DrawnGraph, Graph, Vertex, VertexCreator, EdgeCreator, SearchService, MindMapTemplate){
        var api = {
            offset:function () {
                var offset = {};
                var leftMargin = 150;
                var topMargin = 75;
                offset.left = $("#left-panel").width() + leftMargin;
                offset.top = topMargin;
                return offset;
            },
            start : function(){
                $(document).ready(function(){
                    $("body").hide();
                    UserService.isAuthenticated(
                        callBackWhenIsAuthenticated,
                        function(){
                            window.location = "login.html";
                        }
                    )
                    function callBackWhenIsAuthenticated(){
                        $("body").show();
                        handleIfNotAuthentifiedRedirectToAuthPage();
                        handleDisconnectButton();
                        var sliderDefaultValue = 5;
                        $("#sub-vertices-depth-index").val(sliderDefaultValue);
                        $("#sub-vertices-depth-slider").slider({
                            value:sliderDefaultValue,
                            min:0,
                            max:20,
                            step:1,
                            orientation:"horizontal",
                            slide:function (event, ui) {
                                $("#sub-vertices-depth-index").val(ui.value);
                            },
                            change:function (event, ui) {
                                $("#sub-vertices-depth-index").val(ui.value);
                                if (event.originalEvent) {
                                    DrawnGraph.getWithNewCentralVertex(
                                        Vertex.centralVertex()
                                    );
                                }
                            }
                        });
                        UserService.authenticatedUser(function(){
                            DrawnGraph.getWithDefaultCentralVertex();
                        });

                        $("#redraw-graph-btn").click(function (e) {
                            DrawnGraph.getWithNewCentralVertex(
                                Vertex.centralVertex()
                            );
                        });
                        prepareSearchFeature();
                        function prepareSearchFeature(){
                            $("#vertex-search-input").autocomplete({
                                source : function(request, response){
                                    SearchService.search_for_auto_complete(
                                        request.term,
                                        function(searchResults){
                                            response($.map(searchResults, function(searchResult){
                                                return {
                                                    label : searchResult.label,
                                                    value : searchResult.label,
                                                    id : searchResult.id
                                                }
                                            }));
                                        }
                                    );
                                },
                                select : function(event, ui){
                                    var vertexUri = ui.item.id;
                                    DrawnGraph.getFromNewCentralVertexUri(
                                        vertexUri
                                    );
                                }
                            })
                        }
                    }
                });
            }
        };

        EventBus.subscribe(
            '/event/ui/graph/drawing_info/updated/',
            function (event, drawnGraph, centralVertexId) {
                Graph.reset();
                drawnGraph.bounding_box_width = $("body").width();
                drawnGraph.bounding_box_height = $("body").height();
//                var graphCanvas = MindMapTemplate['graph_canvas'].merge(drawnGraph);
//                $("#drawn_graph").append(graphCanvas);
                $("#drawn_graph").css("min-width", $("body").width());
                $("#drawn_graph").css("min-height", $("body").height());
                if($("body").data(("canvas"))){
                    $("body").data("canvas").clear();
                }
                $("body").data(
                    "canvas",
                    Raphael(0, 0, $("body").width(), $("body").height())
                );
                VertexCreator.createWithArrayOfJsonHavingRelativePosition(
                    drawnGraph.vertices
                );
                EdgeCreator.createWithArrayOfJsonHavingRelativePosition(
                    drawnGraph.edges
                );
                var centralVertex = Vertex.withId(centralVertexId);
                centralVertex.setAsCentral();
                centralVertex.scrollTo();

                $("body").on('click', "svg", function () {
                    var outOfVertexMenus = $('.peripheral-menu');
                    $(outOfVertexMenus).remove();
                });
                DragScroll.start();
                EventBus.publish('/event/ui/graph/drawn');
            }
        );

        function handleIfNotAuthentifiedRedirectToAuthPage(){
            $("html").ajaxError(function (e, jqxhr, settings, exception){
                if(jqxhr.status == 403){
                    window.location = "login.html";
                }
            });
        }
        function handleDisconnectButton(){
            $("#disconnect-btn").click(function(){
                UserService.logout(function(){
                    window.location = "login.html";
                })
            })
        }
        return api;
    }
);


