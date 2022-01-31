describe("properties: ", () => {
    const windowConfig = {
        type: "window",
        appName: "dummyApp"
    };
    const threeContainersConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "column",
                        children: [
                            {
                                type: "row",
                                children: [

                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [
                            {
                                type: "group",
                                children: [
                                    windowConfig
                                ]
                            }
                        ]
                    },
                    {
                        type: "column",
                        children: [

                        ]
                    }
                ]
            }
        ]
    };


    before(() => coreReady);

    afterEach(async () => {
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    describe("id: ", () => {
        it(`Should not be undefined`, async () => {
            const workspace = await glue.workspaces.createWorkspace(threeContainersConfig);
            const currFrame = (await glue.workspaces.getAllFrames())[0];
            expect(currFrame.id).to.not.be.undefined;
            expect(currFrame.id.length).to.not.eql(0);
        });
    });

    describe("isInitialized: Should ", () => {
        const layoutName = "workspaces.layout.integration.test";

        after(async () => {
            const hasLayout = (await glue.workspaces.layouts.getSummaries()).find((s) => s.name === layoutName);

            if (hasLayout) {
                await glue.workspaces.layouts.delete(layoutName);
            }
        });

        it("be true when the frame is started with createWorkspace", async () => {
            const wsp = await glue.workspaces.createWorkspace(threeContainersConfig);

            expect(wsp.frame.isInitialized).to.eql(true);
        });

        it("be true when the frame is started with restoreWorkspace", async () => {
            const wsp = await glue.workspaces.createWorkspace(threeContainersConfig);
            await wsp.saveLayout(layoutName);

            await wsp.close();

            const restoredWorkspace = await glue.workspaces.restoreWorkspace(layoutName);

            expect(restoredWorkspace.frame.isInitialized).to.eql(true);
        });

        it("be false when the frame is started with createFrame", async () => {
            const frame = await glue.workspaces.createEmptyFrame();

            expect(frame.isInitialized).to.be.false;
        });

        it("be true after the frame is initialized by .init when the frame is started with createFrame", async () => {
            const frame = await glue.workspaces.createEmptyFrame();

            await frame.init({ workspaces: [threeContainersConfig] });

            const frameAfterInit = (await glue.workspaces.getAllFrames()).find((f) => f.id === frame.id);
            expect(frameAfterInit.isInitialized).to.be.true;
        });
    })
});
