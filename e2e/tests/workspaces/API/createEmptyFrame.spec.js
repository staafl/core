describe("createEmptyFrame() Should ", () => {
    before(() => coreReady);

    afterEach(async () => {
        gtf.clearWindowActiveHooks();
        const frames = await glue.workspaces.getAllFrames();
        await Promise.all(frames.map((frame) => frame.close()));
    });

    [undefined, {}].forEach((value)=>{
        it(`return a new frame when the passed definition is ${value}`, async () => {
            const framesBeforeOpening = await glue.workspaces.getAllFrames();
            const newFrame = await glue.workspaces.createEmptyFrame(value);
    
            expect(framesBeforeOpening.some(f => f.id === newFrame.id)).to.be.false;
        });
    
        it(`add a new frame to the collection when the passed definition is ${value}`, async () => {
            const framesBeforeOpening = await glue.workspaces.getAllFrames();
            await glue.workspaces.createEmptyFrame(value);
            const framesAfterOpening = await glue.workspaces.getAllFrames();
    
            expect(framesBeforeOpening.length + 1).to.eql(framesAfterOpening.length);
        });
    
        it(`add a new frame which is not initialized when the passed definition is ${value}`, async () => {
            const newFrame = await glue.workspaces.createEmptyFrame(value);
    
            expect(newFrame.isInitialized).to.be.false;
        });
    });
   
});