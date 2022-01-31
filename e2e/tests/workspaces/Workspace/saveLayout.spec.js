describe('saveLayout() Should ', function () {
    const iconForTesting = `data:image/svg+xml,%3Csvg version='1.1' xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 512 512'%3E%3Cpath
    d='M224 448v-96h64v96l-32 64zM336 224v-160c48 0 80-32 80-64v0 0h-320c0 32 32 64 80 64v160c-73.6 22.4-112 64-112 128h384c0-64-38.4-105.6-112-128z'%3E%3C/path%3E%3C/svg%3E%0A`;
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "dummyApp"
                    }
                ]
            }
        ]
    }
    let workspace = undefined;
    let layoutName = undefined;

    before(() => coreReady);

    beforeEach(async () => {
        workspace = await glue.workspaces.createWorkspace(basicConfig);
        layoutName = gtf.getWindowName("layout.integration");
    });

    afterEach(async () => {
        const summaries = await glue.workspaces.layouts.getSummaries();

        await Promise.all(summaries.filter(s => s && s.name && s.name.indexOf("layout.integration") !== -1).map(l => {
            return glue.workspaces.layouts.delete(l.name);
        }));

        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((f) => f.close()));
    });

    it("return a promise", () => {
        const saveLayoutPromise = workspace.saveLayout(layoutName);

        expect(saveLayoutPromise.then).to.be.a("function");
        expect(saveLayoutPromise.catch).to.be.a("function");
    });

    it("resolve", async () => {
        await workspace.saveLayout(layoutName);
    });

    it("populate the summaries collection", async () => {
        await workspace.saveLayout(layoutName);
        const summaries = await glue.workspaces.layouts.getSummaries();

        const summariesContainLayout = summaries.some(s => s.name === layoutName);

        expect(summariesContainLayout).to.be.true;
    });

    it("set the layoutName property to the layout name when the workspace is saved", async () => {
        await workspace.saveLayout(layoutName);
        await workspace.refreshReference();

        expect(workspace.layoutName).to.eql(layoutName);
    });

    it("save the layout with a context when saveContext is true", async () => {
        const savedContext = { test: "42" };
        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName, { saveContext: true });

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql(savedContext);
    });

    it("save the layout without context when saveContext is false", async () => {
        const savedContext = { test: "42" };
        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName, { saveContext: false });

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql({});
    });

    it("save the layout without context when the options object is undefined", async () => {
        const savedContext = { test: "42" };
        await workspace.setContext(savedContext);
        await workspace.saveLayout(layoutName);

        const layouts = await glue.workspaces.layouts.export();
        const layoutUnderTest = layouts.find(l => l.name === layoutName);

        expect(layoutUnderTest.components[0].state.context).to.eql({});
    });

    it("resolve the promise when the workspace has been hibernated", async () => {
        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();

        await workspace.saveLayout(layoutName, { saveContext: false });
    });

    it("save a layout that can be restored when the workspace has been hibernated", async () => {
        await workspace.frame.createWorkspace(basicConfig);
        await workspace.hibernate();

        await workspace.saveLayout(layoutName, { saveContext: false });

        await workspace.frame.restoreWorkspace(layoutName);
    });

    it("not update the title after the save", async () => {
        const title = "myNewTitle";
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.setTitle(title);
        await workspace.saveLayout(layoutName);
        await workspace.refreshReference();

        expect(workspace.title).to.eql(title);
    });

    it("save a layout with isPinned:false when the workspace is not pinned", async () => {
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.saveLayout(layoutName);
        const savedLayout = (await glue.workspaces.layouts.export()).find(l => l.name === layoutName);

        expect(savedLayout.components[0].state.config.isPinned).to.eql(false);
    });

    it("save a layout with isPinned:true when the workspace is pinned", async () => {
        const layoutName = gtf.getWindowName("layout.integration");
        await workspace.pin({ icon: iconForTesting });
        await workspace.saveLayout(layoutName);
        const savedLayout = (await glue.workspaces.layouts.export()).find(l => l.name === layoutName);

        expect(savedLayout.components[0].state.config.isPinned).to.eql(true);
    });

    it("save a layout with an icon when the workspace has an icon", async () => {
        const layoutName = gtf.getWindowName("layout.integration");
        await workspace.pin({ icon: iconForTesting });
        await workspace.saveLayout(layoutName);
        const savedLayout = (await glue.workspaces.layouts.export()).find(l => l.name === layoutName);

        expect(savedLayout.components[0].state.config.icon).to.eql(iconForTesting);
    });

    it("save a layout without an icon when the workspace doesn't have an icon", async () => {
        const layoutName = gtf.getWindowName("layout.integration");
        await workspace.saveLayout(layoutName);
        const savedLayout = (await glue.workspaces.layouts.export()).find(l => l.name === layoutName);

        expect(savedLayout.components[0].state.config.icon).to.be.null; // the interop converts undefined to null
    });

    it("successfully save the passed metadata", async () => {
        const metadata = {
            test: 42
        };
        const layoutName = gtf.getWindowName("layout.integration");

        await workspace.saveLayout(layoutName, { metadata });

        const allLayouts = await glue.workspaces.layouts.export();
        const currentLayout = allLayouts.find(l => l.name === layoutName);

        expect(currentLayout.metadata).to.eql(metadata);
    });

    Array.from([[], {}, 42, undefined, null]).forEach((input) => {
        it(`reject when the layout name is ${JSON.stringify(input)}`, (done) => {
            workspace.saveLayout(input)
                .then(() => done("Should not resolve"))
                .catch(() => done());
        });
    });
});
