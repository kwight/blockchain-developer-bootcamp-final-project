const Fundraisers = artifacts.require('Fundraisers');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Fundraisers', async accounts => {
  const [contractOwner, charity1, charity2, bystander] = accounts;
  let instance;

  beforeEach(async () => {
    instance = await Fundraisers.new();
  });

  describe('Charities', () => {
    it('allows only the owner to add charities', async () => {
      assert.equal(
        contractOwner,
        await instance.owner(),
        'the owner is not properly assigned',
      );

      await instance.registerCharity(charity1);
      assert.equal(
        await instance.charities(charity1),
        true,
        'the owner cannot register charities'
      )

      assert.equal(
        await instance.charityList(0),
        charity1,
        'the owner cannot register charities'
      )

      await expectRevert(
        instance.registerCharity.call(charity1, { from: charity1 }),
        'Ownable: caller is not the owner',
      );
    });

    it('allows the owner to remove charities', async () => {
      await instance.registerCharity(charity1);
      await instance.removeCharity(charity1);

      assert.equal(
        await instance.charities(charity1),
        false,
        'the owner cannot remove a charity'
      );
    });

    it('allows a charity to only remove itself', async () => {
      await instance.registerCharity(charity1);
      await instance.registerCharity(charity2);

      await expectRevert(
        instance.removeCharity(charity1, { from: charity2 }),
        'unauthorized',
      );

      await expectRevert(
        instance.removeCharity(charity1, { from: bystander }),
        'unauthorized',
      );

      await instance.removeCharity(charity1, { from: charity1 });
      assert.equal(
        await instance.charities(charity1),
        false,
        'a charity cannot remove itself'
      );
    });

    it('allows only five charities to be registered', async () => {
      await instance.registerCharity(accounts[1]);
      await instance.registerCharity(accounts[2]);
      await instance.registerCharity(accounts[3]);
      await instance.registerCharity(accounts[4]);
      await instance.registerCharity(accounts[5]);

      await expectRevert(
        instance.registerCharity(accounts[6]),
        'maximum charities already registered',
      );
    });

    it('allows anyone to get all registered charities', async () => {
      await instance.registerCharity(charity1);
      const result = await instance.getCharities({ from: bystander });

      assert.equal(
        result[0],
        charity1,
        'charities could not be properly read'
      );
    });
  });

  describe('Events', () => {
    beforeEach(async () => {
      await instance.registerCharity(charity1);
      await instance.registerCharity(charity2);
      await instance.registerEvent('event1', Math.floor(Date.now() / 1000), { from: charity1 });
      await instance.registerEvent('event2', Math.floor(Date.now() / 1000), { from: charity1 });
    });

    it('allows only active charities to create events', async () => {
      await instance.removeCharity(charity2);

      const event = await instance.events(0);
      assert.equal(
        event.title,
        'event1',
        'active charity cannot register events'
      );

      await expectRevert(
        instance.registerEvent('title', Math.floor(Date.now() / 1000)),
        'unauthorized',
      );

      await expectRevert(
        instance.registerEvent('title', Math.floor(Date.now() / 1000), { from: charity2 }),
        'unauthorized',
      );
    });

    it('allows only active charities to cancel their events', async () => {
      await instance.cancelEvent(0, { from: charity1 });
      const cancelledEvent = await instance.events(0);

      assert.equal(
        cancelledEvent.status.toNumber(),
        2,
        'charity cannot cancel its events'
      );

      await expectRevert(
        instance.cancelEvent(1),
        'unauthorized',
      );

      await expectRevert(
        instance.cancelEvent(1, { from: charity2 }),
        'unauthorized',
      );

      await instance.removeCharity(charity1);
      await expectRevert(
        instance.cancelEvent(1, { from: charity1 }),
        'unauthorized',
      );
    });
  });
});
