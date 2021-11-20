const Fundraisers = artifacts.require('Fundraisers');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Fundraisers', async accounts => {
  const [contractOwner, charity1, charity2, charity3, bystander] = accounts;
  let instance;

  beforeEach(async () => {
    instance = await Fundraisers.new();
  });

  describe('Charities', () => {
    it('can add charities', async () => {
      await instance.registerCharity(charity1, 'charity1');
      const charities = await instance.getCharities();
      const charity = await instance.getCharity(charity1);

      assert.equal(
        charities[0],
        charity1,
        'the charity is not listed'
      );

      assert.equal(
        charity.name,
        'charity1',
        'the charity is not being mapped'
      );
    });

    it('can remove charities', async () => {
      await instance.registerCharity(charity1, 'charity1');
      await instance.registerCharity(charity2, 'charity2');
      await instance.registerCharity(charity3, 'charity3');
      await instance.removeCharity(charity1);
      const charities = await instance.getCharities();

      assert.equal(
        charities.includes(charity1),
        false,
        'the charity is still listed'
      );

      assert.equal(
        charities[0],
        charity3,
        'charities were not properly reordered'
      );

      assert.equal(
        charities.length,
        2,
        'charitt list length is incorrect'
      );
    });

    it('allows only the owner to add charities', async () => {
      await instance.registerCharity(charity1, 'charity1');
      const charities = await instance.getCharities();

      assert.equal(
        contractOwner,
        await instance.owner(),
        'the owner is not properly assigned',
      );

      assert.equal(
        charities[0],
        charity1,
        'the owner cannot register charities'
      )

      await expectRevert(
        instance.registerCharity(charity2, 'charity2', { from: charity1 }),
        'Ownable: caller is not the owner',
      );
    });

    it('ensures charities are uniquely registered', async () => {
      await instance.registerCharity(charity1, 'charity1');

      await expectRevert(
        instance.registerCharity(charity1, 'charity1'),
        'charity already exists',
      );
    });

    it('allows the owner to remove charities', async () => {
      await instance.registerCharity(charity1, 'charity1');
      await instance.removeCharity(charity1);
      const charities = await instance.getCharities();

      assert.equal(
        charities.length,
        0,
        'the owner cannot remove a charity'
      );
    });

    it('allows a charity to only remove itself', async () => {
      await instance.registerCharity(charity1, 'charity1');
      await instance.registerCharity(charity2, 'charity2');
      await instance.registerCharity(charity3, 'charity3');
      await instance.removeCharity(charity1, { from: charity1 });
      const charities = await instance.getCharities();

      assert.equal(
        charities.includes(charity1),
        false,
        'a charity cannot remove itself'
      );

      await expectRevert(
        instance.removeCharity(charity2, { from: charity3 }),
        'unauthorized',
      );

      await expectRevert(
        instance.removeCharity(charity2, { from: bystander }),
        'unauthorized',
      );
    });

    it('emits events on charity registration and removal', async () => {
      const registration = await instance.registerCharity(charity1, 'charity1');
      const removal = await instance.removeCharity(charity1);

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
      await instance.registerCharity(charity1, 'charity1');
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
      await instance.registerCharity(charity1, 'charity1');
      await instance.registerCharity(charity2, 'charity2');
      const latestBlock = await web3.eth.getBlock('latest');
      await instance.registerEvent('event1', latestBlock.timestamp + 43205, { from: charity1 });
      await instance.registerEvent('event2', latestBlock.timestamp + 43205, { from: charity1 });
    });

    it('allows only active charities to create events', async () => {
      await instance.removeCharity(charity2);
      const latestBlock = await web3.eth.getBlock('latest');

      await expectRevert(
        instance.registerEvent('event3', latestBlock.timestamp + 45000),
        'unauthorized',
      );

      await expectRevert(
        instance.registerEvent('event4', latestBlock.timestamp + 45000, { from: charity2 }),
        'unauthorized',
      );
    });

    it('allows only active charities to cancel their events', async () => {
      await instance.cancelEvent(0, { from: charity1 });
      const events = await instance.getEvents();

      assert.equal(
        events[0].status,
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

    it('only allows existing active events to be cancelled', async () => {
      await instance.cancelEvent(0, { from: charity1 });
      await instance.completeEvent(1, { from: charity1 });

      await expectRevert(
        instance.cancelEvent(2, { from: charity1 }),
        'event does not exist',
      );

      await expectRevert(
        instance.cancelEvent(0, { from: charity1 }),
        'event is not active',
      );
    });

    it('only allows existing active events to be completed', async () => {
      await instance.cancelEvent(0, { from: charity1 });
      await instance.completeEvent(1, { from: charity1 });

      await expectRevert(
        instance.completeEvent(2, { from: charity1 }),
        'event does not exist',
      );

      await expectRevert(
        instance.completeEvent(0, { from: charity1 }),
        'event is not active',
      );
    });

    it('only allows events to be registered at least twelve hours in advance', async () => {
      let latestBlock = await web3.eth.getBlock('latest');
      await expectRevert(
        instance.registerEvent('event3', latestBlock.timestamp + 43200, { from: charity1 }),
        'event is scheduled too soon',
      );
    });

    it('emits events on charity event registration, cancellation, and completion', async () => {
      const latestBlock = await web3.eth.getBlock('latest');
      const registration = await instance.registerEvent('event1', latestBlock.timestamp + 43205, { from: charity1 });
      const cancellation = await instance.cancelEvent(0, { from: charity1 });
      const completion = await instance.completeEvent(1, { from: charity1 });

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

      assert.equal(
        completion.logs[0].event,
        'EventCompleted',
        'no event emitted on charity event completion'
      );
    });
  });

  describe('Participants', () => {
    beforeEach(async () => {
      await instance.registerCharity(charity1, 'charity1');
      const latestBlock = await web3.eth.getBlock('latest');
      await instance.registerEvent('event1', latestBlock.timestamp + 43205, { from: charity1 });
    });

    it('allows anyone to participate in an event', async () => {
      await instance.registerForEvent(0, { from: bystander });

      assert.equal(
        await instance.isParticipatingInEvent(bystander, 0),
        true,
        'not anyone can participate in an event'
      );
    });

    it('allows a participant to deregister', async () => {
      await instance.registerForEvent(0, { from: bystander });
      await instance.deregisterForEvent(0, { from: bystander });

      assert.equal(
        await instance.isParticipatingInEvent(bystander, 0),
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
