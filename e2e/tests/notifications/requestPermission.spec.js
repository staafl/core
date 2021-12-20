describe("requestPermission ", () => {
    before(() => coreReady);

    beforeEach(() => window.notificationsFakePermission = "granted");

    afterEach(() => {
        window.sinonSandbox.reset();
        window.notificationsFakePermission = "granted";
    });

    it("should resolve", async () => {
        await glue.notifications.requestPermission();
    });

    it("should resolve with true, when permission is granted", async () => {
        window.notificationsFakePermission = "granted";

        const permission = await glue.notifications.requestPermission();

        expect(permission).to.be.true;
    });

    it("should resolve with false when permission is not granted", async () => {
        window.notificationsFakePermission = "denied";

        const permission = await glue.notifications.requestPermission();

        expect(permission).to.be.false;
    });

});