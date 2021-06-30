import { expect } from "chai";
import { createGlue, doneAllGlues } from "../initializer";
import { Glue42Core } from "../../glue";
import { generate } from "shortid";
import { PromiseWrapper } from "../../src/utils/pw";

// tslint:disable:no-unused-expression

describe("contexts.create", () => {

    let secret: string = "";
    let secret2: string = "";
    let glueCreator!: Glue42Core.GlueCore;
    let gluePermissioned!: Glue42Core.GlueCore;
    let glueNotPermissioned!: Glue42Core.GlueCore;
    let glueReadPermissioned!: Glue42Core.GlueCore;

    beforeEach(async () => {
        secret = generate() + "." + generate()
        secret2 = generate() + "." + generate()
        glueCreator = await createGlue();
        gluePermissioned = await createGlue("child-" + secret);
        glueNotPermissioned = await createGlue();
        glueReadPermissioned = await createGlue("child-" + secret2);
    });

    afterEach(async () => {
        await doneAllGlues();
    });

    it("check if creating a new context with data works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        glueCreator.contexts.subscribe(ctxName, async () => {
        gluePermissioned.contexts.subscribe(ctxName, async () => {
            expect(await glueCreator.contexts.get(ctxName)).to.deep.equal(data);
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal(data);
            pw.resolve();
        });
        });
        return pw.promise;
    });

    it("check if create for existing context with data works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        await gluePermissioned.contexts.create(ctxName, data2);
        // the point of these subscribe methods is to add an extra round-trip time so all peers
        // are in sync
        glueCreator.contexts.subscribe(ctxName, async () => {
            gluePermissioned.contexts.subscribe(ctxName, async () => {
                expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data });
                expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data });
                pw.resolve();
            });
        });
        return pw.promise;
    });

    
    it("check if create for existing context with data works (+update)", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { moo: generate() };
        await glueCreator.contexts.create(ctxName, data);
        await gluePermissioned.contexts.create(ctxName, data2);
        await gluePermissioned.contexts.update(ctxName, data3);
        glueCreator.contexts.subscribe(ctxName, async () => {
            gluePermissioned.contexts.subscribe(ctxName, async () => {
                expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data3 });
                expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data3 });
                pw.resolve();
            });
        });
        return pw.promise;
    });
    
    it("check if creating a new context with data and read restrictions works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        await glueCreator.contexts.create(ctxName, data, { readPermissions: `$application == 'child-${secret}'` });
        glueCreator.contexts.subscribe(ctxName, async () => {
            gluePermissioned.contexts.subscribe(ctxName, async () => {
                expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal(data);
                expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({});
                pw.resolve();
            });
        });

        return pw.promise;
    });


    it("check if creating a new context with data and write restrictions works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { boo: generate() };
        const data4 = { zoo: generate() };
        await glueCreator.contexts.create(ctxName, data, { writePermissions: `$application == 'child-${secret}'` });
        glueCreator.contexts.subscribe(ctxName, async () => {
            await glueCreator.contexts.update(ctxName, data2);
            await gluePermissioned.contexts.update(ctxName, data3);
            try {
                await glueNotPermissioned.contexts.update(ctxName, data4);
                expect(false).to.equal(true);
            } catch (e) {
            }
            expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
            pw.resolve();
        });

        return pw.promise;
    });

    it("check if creating a new context with data and read and write restrictions works", async () => {
        const pw = new PromiseWrapper();
        const ctxName = generate();
        const data = { foo: generate() };
        const data2 = { moo: generate() };
        const data3 = { boo: generate() };
        const data4 = { zoo: generate() };
        await glueCreator.contexts.create(ctxName, data, {
            readPermissions: `$application == 'child-${secret2}'`,
            writePermissions: `$application == 'child-${secret}'`
        });
        glueCreator.contexts.subscribe(ctxName, async () => {
            await glueCreator.contexts.update(ctxName, data2);
            await gluePermissioned.contexts.update(ctxName, data3);
            gluePermissioned.contexts.subscribe(ctxName, async () => {
                try {
                    await glueNotPermissioned.contexts.update(ctxName, data4);
                    expect(false).to.equal(true);
                } catch (e) {
                }
                expect(await glueCreator.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
                expect(await gluePermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
                expect(await glueReadPermissioned.contexts.get(ctxName)).to.deep.equal({ ...data, ...data2, ...data3 });
                expect(await glueNotPermissioned.contexts.get(ctxName)).to.deep.equal({ });
            });
            pw.resolve();
        });

        return pw.promise;
    });

});
