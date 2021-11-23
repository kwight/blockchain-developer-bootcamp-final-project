const Fundraisers = artifacts.require('Fundraisers');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Fundraisers', async accounts => {
  const [contractOwner, charity1, charity2, charity3, doner, bystander] = accounts;
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

  describe('Programs', () => {
    beforeEach(async () => {
      await instance.registerCharity(charity1, 'charity1');
      await instance.registerCharity(charity2, 'charity2');
      const latestBlock = await web3.eth.getBlock('latest');
      await instance.registerProgram('program1', { from: charity1 });
      await instance.registerProgram('program2', { from: charity1 });
    });

    it('allows only active charities to create programs', async () => {
      await instance.removeCharity(charity2);

      await expectRevert(
        instance.registerProgram('program3'),
        'unauthorized',
      );

      await expectRevert(
        instance.registerProgram('program4', { from: charity2 }),
        'revert'
      );
    });

    it('allows only active charities to cancel their programs', async () => {
      await instance.cancelProgram(0, { from: charity1 });
      const programs = await instance.getPrograms();

      assert.equal(
        programs[0].status,
        1,
        'charity cannot cancel its programs'
      );

      await expectRevert(
        instance.cancelProgram(1),
        'unauthorized',
      );

      await expectRevert(
        instance.cancelProgram(1, { from: charity2 }),
        'unauthorized',
      );

      await instance.removeCharity(charity1);
      await expectRevert(
        instance.cancelProgram(1, { from: charity1 }),
        'unauthorized',
      );
    });

    it('only allows existing active programs to be cancelled', async () => {
      await instance.cancelProgram(0, { from: charity1 });
      await instance.completeProgram(1, { from: charity1 });

      await expectRevert(
        instance.cancelProgram(2, { from: charity1 }),
        'program does not exist',
      );

      await expectRevert(
        instance.cancelProgram(0, { from: charity1 }),
        'program is not active',
      );
    });

    it('only allows existing active programs to be completed', async () => {
      await instance.cancelProgram(0, { from: charity1 });
      await instance.completeProgram(1, { from: charity1 });

      await expectRevert(
        instance.completeProgram(2, { from: charity1 }),
        'program does not exist',
      );

      await expectRevert(
        instance.completeProgram(0, { from: charity1 }),
        'program is not active',
      );
    });

    it('emits events on program registration, cancellation, and completion', async () => {
      const registration = await instance.registerProgram('program1', { from: charity1 });
      const cancellation = await instance.cancelProgram(0, { from: charity1 });
      const completion = await instance.completeProgram(1, { from: charity1 });

      assert.equal(
        registration.logs[0].event,
        'ProgramRegistered',
        'no event emitted on program registration'
      );

      assert.equal(
        cancellation.logs[0].event,
        'ProgramCancelled',
        'no event emitted on program cancellation'
      );

      assert.equal(
        completion.logs[0].event,
        'ProgramCompleted',
        'no event emitted on program completion'
      );
    });
  });

  describe('Donations', () => {
    beforeEach(async () => {
      await instance.registerCharity(charity1, 'charity1');
      await instance.registerProgram('program1', { from: charity1 });
    });

    it('transfers donations to the charity', async () => {
      const charityBalance = Number(await web3.eth.getBalance(charity1));
      const donerBalance = Number(await web3.eth.getBalance(doner));
      await instance.donate(0, { from: doner, value: 12345 });

      assert.equal(
        Number(await web3.eth.getBalance(charity1)),
        charityBalance + 12345,
        'charities do not receive donations'
      );

      assert.isAtMost(
        Number(await web3.eth.getBalance(doner)),
        donerBalance - 12345,
        'doners do not send donations'
      );
    });

    it('allows donations for only active programs', async () => {
      await instance.registerProgram('program2', { from: charity1 });
      await instance.cancelProgram(1, { from: charity1 });

      await expectRevert(
        instance.donate(2, { from: doner, value: 12345 }),
        'program does not exist',
      );

      await expectRevert(
        instance.donate(1, { from: doner, value: 12345 }),
        'program is not active',
      );
    });

    it('emits an event on successful donation', async () => {
      const donation = await instance.donate(0, { from: doner, value: 12345 });

      assert.equal(
        donation.logs[0].event,
        'DonationReceived',
        'no event emitted on donation'
      );
    });
  });
});
