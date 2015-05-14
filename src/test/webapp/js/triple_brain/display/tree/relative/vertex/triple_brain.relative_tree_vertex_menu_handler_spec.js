/*
 * Copyright Vincent Blouin under the GPL License version 3
 */

define([
    'test/webapp/js/test-scenarios',
    "test/webapp/js/mock/triple_brain.vertex_service_mock",
    'triple_brain.relative_tree_vertex_menu_handler',
    'triple_brain.vertex_service',
    'triple_brain.mind_map_info'
], function (Scenarios, VertexServiceMock, RelativeTreeVertexMenuHandler, VertexService, MindMapInfo) {
    "use strict";
    describe("relative_tree_vertex_menu_handler", function () {
        var threeBubbles;
        beforeEach(function () {
            threeBubbles = new Scenarios.threeBubblesGraph();
        });
        it("removes connected edges when removing a vertex", function () {
            VertexServiceMock.removeVertex();
            MindMapInfo._setIsViewOnly(false);
            var bubble1 = threeBubbles.getBubble1InTree(),
                r1 = threeBubbles.getRelation1InTree();
            expect(
                bubble1.getNumberOfChild()
            ).toBe(2);
            var bubble2 = r1.getTopMostChildBubble();
            RelativeTreeVertexMenuHandler.forSingle().removeAction(bubble2, true);
            expect(
                bubble1.getNumberOfChild()
            ).toBe(1);
        });
        it("cannot add sibling if center bubble", function () {
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            expect(
                RelativeTreeVertexMenuHandler.forSingle().addSiblingCanDo(
                    someChild
                )
            ).toBeTruthy();
            expect(
                RelativeTreeVertexMenuHandler.forSingle().addSiblingCanDo(
                    bubble1
                )
            ).toBeFalsy();
        });
        it("can add sibling", function () {
            VertexServiceMock.addRelationAndVertexToVertexMock();
            var bubble1 = new Scenarios.threeBubblesGraph().getBubble1InTree();
            var numberOfChild = bubble1.getNumberOfChild();
            var someChild = bubble1.getTopMostChildBubble().getTopMostChildBubble();
            RelativeTreeVertexMenuHandler.forSingle().addSiblingAction(someChild);
            expect(
                bubble1.getNumberOfChild()
            ).toBe(numberOfChild + 1);
        });
    });
});