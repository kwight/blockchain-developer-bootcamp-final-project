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
        instance.registerCharity(charity1, { from: charity1 }),
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

    it('emits events on charity registration and removal', async () => {
      const registration = await instance.registerCharity(accounts[1]);
      const removal = await instance.removeCharity(accounts[1]);

      assert.equal(
        registration.logs[0].event,
        'CharityRegistered',
        'no event emitted on charity registration'
      );

      assert.equal(
        removal.logs[0].event,
        'CharityRemoved',
        'no event emitted on charity registration'
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

    it('emits events on charity event registration and cancellation', async () => {
      const registration = await instance.registerEvent('event3', Math.floor(Date.now() / 1000), { from: charity1 });
      const cancellation = await instance.cancelEvent(0, { from: charity1 });

      assert.equal(
        registration.logs[0].event,
        'EventRegistered',
        'no event emitted on charity event registration'
      );

      assert.equal(
        cancellation.logs[0].event,
        'EventCancelled',
        'no event emitted on charity event cancellation'
      );
    });
  });

  describe('Participants', () => {
    beforeEach(async () => {
      await instance.registerCharity(charity1);
      await instance.registerEvent('event1', Math.floor(Date.now() / 1000), { from: charity1 });
    });

    it('allows anyone to participate in an event', async () => {
      await instance.registerForEvent(0, { from: bystander });

      assert.equal(
        await instance.eventParticipants(0, bystander),
        true,
        'not anyone can participate in an event'
      );
    });

    it('allows anyone to get all participants', async () => {
      await instance.registerForEvent(0, { from: charity1 });
      const result = await instance.getParticipants({ from: bystander });

      assert.equal(
        result[0],
        charity1,
        'participants could not be properly read'
      );
    });

    it('allows a participant to deregister', async () => {
      await instance.registerForEvent(0, { from: bystander });
      await instance.deregisterForEvent(0, { from: bystander });

      assert.equal(
        await instance.eventParticipants(0, bystander),
        false,
        'a participant cannot deregister'
      );
    });

    it('emits events on participant registration and deregistration', async () => {
      const registration = await instance.registerForEvent(0);
      const deregistration = await instance.deregisterForEvent(0);

      assert.equal(
        registration.logs[0].event,
        'ParticipantRegistered',
        'no event emitted on charity event registration'
      );

      assert.equal(
        deregistration.logs[0].event,
        'ParticipantDeregistered',
        'no event emitted on charity event cancellation'
      );
    });
  });
});
