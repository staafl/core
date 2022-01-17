describe("pin() Should", () => {
    const iconForTesting = `data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 512 512'%3E%3Cpath
    d='M224 448v-96h64v96l-32 64zM336 224v-160c48 0 80-32 80-64v0 0h-320c0 32 32 64 80 64v160c-73.6 22.4-112 64-112 128h384c0-64-38.4-105.6-112-128z'%3E%3C/path%3E%3C/svg%3E%0A`;
    const iconForTesting2 = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23FFFFFF'%3E%3Cpath d='M0 0h24v24H0z' fill='none'/%3E%3Cpath d='M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z'/%3E%3C/svg%3E`;

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

    it("resolve when the workspace is selected", async () => {
        await workspace.pin(iconForTesting);
        expect(workspace.isPinned).to.be.true;
    });

    it("resolve when the workspace is selected and locked", async () => {
        await workspace.lock();
        await workspace.pin(iconForTesting);
        expect(workspace.isPinned).to.be.true;
    });

    it("change the workspace icon", async () => {
        await workspace.pin(iconForTesting);
        const workspaceIcon = await workspace.getIcon();

        expect(workspaceIcon).to.eql(iconForTesting);
    });

    it("change the workspace icon when the workspace has already been pinned", async () => {
        await workspace.pin(iconForTesting2);
        await workspace.pin(iconForTesting);
        const workspaceIcon = await workspace.getIcon();

        expect(workspaceIcon).to.eql(iconForTesting);
    });

    it("resolve when the workspace is empty", async () => {
        const emptyWorkspace = await glue.workspaces.createWorkspace(emptyConfig);

        await emptyWorkspace.pin(iconForTesting);
        expect(emptyWorkspace.isPinned).to.be.true;
    });

    it("move the workspace to the front", async () => {
        const firstWorkspace = await glue.workspaces.createWorkspace(emptyConfig);
        const secondWorkspace = await glue.workspaces.createWorkspace(emptyConfig);
        const thirdWorkspace = await glue.workspaces.createWorkspace(emptyConfig);

        await thirdWorkspace.pin(iconForTesting);
        expect(thirdWorkspace.positionIndex).to.eql(0);
    });

    it("move the workspace behind the other pinned workspace", async () => {
        const firstWorkspace = await glue.workspaces.createWorkspace(emptyConfig);
        const secondWorkspace = await glue.workspaces.createWorkspace(emptyConfig);
        const thirdWorkspace = await glue.workspaces.createWorkspace(emptyConfig);

        await thirdWorkspace.pin(iconForTesting);
        await secondWorkspace.pin(iconForTesting);
        expect(secondWorkspace.positionIndex).to.eql(1);
    });

    describe("", () => {
        beforeEach(async () => {
            await glue.workspaces.createWorkspace(basicConfig);
        });

        it("resolve when the workspace is not selected", async () => {
            await workspace.pin(iconForTesting);
            expect(workspace.isPinned).to.be.true;
        });

        it("resolve when the workspace is not selected and hibernated", async () => {
            await workspace.hibernate();
            await workspace.pin(iconForTesting);
            expect(workspace.isPinned).to.be.true;
        });

        it("resolve when the workspace is not selected and locked", async () => {
            await workspace.lock();
            await workspace.pin(iconForTesting);

            expect(workspace.isPinned).to.be.true;
        });

        it("pin the workspace using its icon passed from the configuration when the workspace already contains an icon", async () => {
            const workspaceWithIcon = await glue.workspaces.createWorkspace(Object.assign({}, basicConfig, { config: { icon: iconForTesting } }))
        });
    });
});