describe("restore() Should", () => {
    const config = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: []
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    {
                                        type: "window",
                                        appName: "noGlueApp"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: []
                    },
                    {
                        type: "column",
                        children: [{
                            type: "group",
                            children: []
                        }]
                    }
                ]
            }
        ]
    };

    let workspace;
    before(() => coreReady);
    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(config);
    });

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });
    Array.from(["row", "column", "group"]).forEach((type) => {
        it(`resolve when the item is a maximized ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type);

            await targetItem.maximize();
            await targetItem.restore();
        });

        it(`resolve when the item is an empty maximized ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type && !b.children.length);

            await targetItem.maximize();
            await targetItem.restore();
        });

        it(`resolve when the item is not maximized and is as ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type && !b.children.length);

            await targetItem.restore();
        });

        it(`update the property isMaximized to false when the item is a maximized ${type}`, async () => {
            const targetItem = workspace.getAllBoxes().find(b => b.type === type);

            await targetItem.maximize();
            await targetItem.restore();

            expect(targetItem.isMaximized).to.eql(false);
        });

    });
});