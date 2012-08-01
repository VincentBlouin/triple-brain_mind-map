if (triple_brain.vertex == undefined) {
    (function ($) {
        var eventBus = triple_brain.event_bus;
        var idUriStatic = triple_brain.id_uri;
        triple_brain.vertex = {
            addRelationAndVertexAtPositionToVertex:function (vertex, newVertexPosition, callback) {
                $.ajax({
                    type:'POST',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId()),
                    dataType:'json'
                }).success(function (statementNewRelation) {
                        if (callback != undefined) {
                            callback.call(this, statementNewRelation);
                        }
                        var triple = triple_brain.ui.triple.fromServerStatementAndNewVertexPosition(
                            statementNewRelation,
                            newVertexPosition
                        )
                        eventBus.publish(
                            '/event/ui/graph/vertex_and_relation/added/',
                            [triple]
                        );
                    })
            },
            remove:function (vertex) {
                $.ajax({
                    type:'DELETE',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId())
                }).success(function () {
                        eventBus.publish(
                            '/event/ui/graph/vertex/deleted/',
                            vertex
                        )
                    })
            },
            updateLabel:function (vertex, label) {
                $.ajax({
                    type:'POST',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId()) + '/label?label=' + label,
                    dataType:'json'
                }).success(function () {
                        eventBus.publish(
                            '/event/ui/graph/vertex/label/updated',
                            vertex
                        )
                    })
            },
            updateType:function (vertex, type) {
                $.ajax({
                    type:'POST',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId()) + '/type?type_uri=' + typeUri,
                    dataType:'json'
                }).success(function () {
                        vertex.setType(type);
                    })
            },
            updateSameAs:function (vertex, sameAsUri) {
                $.ajax({
                    type:'POST',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId()) + '/?same_as_uri=' + sameAsUri,
                    dataType:'json'
                }).success(function () {
                        eventBus.publish(
                            '/event/ui/graph/vertex/same_as/updated',
                            [vertex, sameAsUri]
                        );
                    })
            },
            setSuggestions:function (vertex, suggestions) {
                $.ajax({
                    type:'POST',
                    url:options.ws.app + '/service/vertex/' + idUriStatic.encodedUriFromId(vertex.getId()) + '/suggestions',
                    dataType:'json',
                    data:triple_brain.suggestion.formatAllForServer(suggestions),
                    contentType:'application/json;charset=utf-8'
                }).success(function () {
                        eventBus.publish(
                            '/event/ui/graph/vertex/type/properties/updated',
                            [vertex, suggestions]
                        );
                    })
            }
        }

    })(jQuery);

}