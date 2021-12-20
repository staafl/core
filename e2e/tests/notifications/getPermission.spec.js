describe("getPermission ", () => {
    before(() => coreReady);

    beforeEach(() => window.notificationsFakePermission = "granted");

    afterEach(() => {
        window.sinonSandbox.reset();
        window.notificationsFakePermission = "granted";
    });

    it("should resolve", async () => {
        await glue.notifications.getPermission();
    });

    it("should resolve with granted by default, because of setup", async () => {
        const permission = await glue.notifications.getPermission();

        expect(permission).to.eql("granted");
    });

    it("should resolve with default, when it is default", async () => {
        window.notificationsFakePermission = "default"

        const permission = await glue.notifications.getPermission();

        expect(permission).to.eql("default");
    });

    it("should resolve with denied, when it is denied", async () => {
        window.notificationsFakePermission = "denied"

        const permission = await glue.notifications.getPermission();

        expect(permission).to.eql("denied");
    });

});