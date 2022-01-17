describe("unpin() Should", () => {
    const iconForTesting = `data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 512 512'%3E%3Cpath
    d='M224 448v-96h64v96l-32 64zM336 224v-160c48 0 80-32 80-64v0 0h-320c0 32 32 64 80 64v160c-73.6 22.4-112 64-112 128h384c0-64-38.4-105.6-112-128z'%3E%3C/path%3E%3C/svg%3E%0A`;
    const basicConfig = {
        children: [{
            type: "column",
            children: [{
                type: "row",
                children: [
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            }
                        ]
                    },
                    {
                        type: "group",
                        children: [
                            {
                                type: "window",
                                appName: "noGlueApp"
                            }
                        ]
                    },
                ],
            },
            {
                type: "group",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }]
        }]
    };

    const emptyConfig = {
        children: []
    }

    let workspace = undefined;

    before(async () => {
        await coreReady;
    });

    beforeEach(async () => {
        gtf.clearWindowActiveHooks();
        workspace = await glue.workspaces.createWorkspace(basicConfig);
    });

    afterEach(async () => {
        const wsps = await glue.workspaces.getAllWorkspaces();
        await Promise.all(wsps.map((wsp) => wsp.close()));
    });

    it("resolve", async () => {
        await workspace.pin(iconForTesting);
        await workspace.unpin();
        expect(workspace.isPinned).to.be.false;
    });

    it("do nothing when the workspace isn't pinned", async () => {
        await workspace.unpin();
        expect(workspace.isPinned).to.be.false;
    });

    it("unpin the workspace when it's locked", async () => {
        await workspace.pin(iconForTesting);
        await workspace.lock();
        await workspace.unpin();
        expect(workspace.isPinned).to.be.false;
    });

    it("unpin the workspace when it's empty", async () => {
        const emptyWorkspace = await glue.workspaces.createWorkspace(emptyConfig);

        await emptyWorkspace.pin(iconForTesting);
        await emptyWorkspace.unpin();

        expect(emptyWorkspace.isPinned).to.eql(false);
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("resolve when the workspace is not selected", async () => {
            await workspace.pin(iconForTesting);
            await workspace.unpin();
            expect(workspace.isPinned).to.be.false;
        });

        it("do nothing when the workspace isn't pinned and is not selected", async () => {
            await workspace.unpin();
            expect(workspace.isPinned).to.be.false;
        });

        it("unpin the workspace when it's locked and is not selected", async () => {
            await workspace.pin(iconForTesting);
            await workspace.lock();
            await workspace.unpin();
            expect(workspace.isPinned).to.be.false;
        });

        it("unpin the workspace when it's hibernated", async () => {
            await workspace.pin(iconForTesting);
            await workspace.hibernate();
            await workspace.unpin();
            expect(workspace.isPinned).to.be.false;
        });
    });
});