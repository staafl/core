describe("onInitializationRequested() Should ", () => {
    const basicConfig = {
        children: [
            {
                type: "row",
                children: [
                    {
                        type: "window",
                        appName: "noGlueApp"
                    }
                ]
            }
        ]
    };


    before(async () => {
        await coreReady;
    });


    afterEach(async () => {
        gtf.clearWindowActiveHooks();
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    it("be invoked when the frame is not initialized", (done) => {
        glue.workspaces.createEmptyFrame().then((frame) => {
            frame.onInitializationRequested(() => {
                done();
            });
        }).catch(done);
    });

    it("dont be invoked when the frame has been initialized", (done) => {
        gtf.wait(5000).then(() => {
            done();
        });
        glue.workspaces.createWorkspace(basicConfig).then((wsp) => {
            wsp.frame.onInitializationRequested(() => {
                done("Should not be invoked");
            });
        });
    });

    it("pass the context from the frame creation when the frame is empty and a context has been passed", (done) => {
        const context = { test: "42" };
        glue.workspaces.createEmptyFrame({ context }).then((frame) => {
            frame.onInitializationRequested((initContext) => {
                expect(initContext.context).to.eql(context);
                done();
            });
        });
    });
});