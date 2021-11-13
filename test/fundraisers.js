const Fundraisers = artifacts.require('Fundraisers');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Fundraisers', async accounts => {
  const [contractOwner, charity1, charity2] = accounts;

  beforeEach(async () => {
    instance = await Fundraisers.new();
  });

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

  it('allows the owner or the charity itself to remove charities', async () => {
    await instance.removeCharity(charity1);
    assert.equal(
      await instance.charities(charity1),
      false,
      'the owner cannot remove a charity'
    );

    await instance.removeCharity.call(charity1, { from: charity1 });
    assert.equal(
      await instance.charities(charity1),
      false,
      'a charity cannot remove itself'
    );

    await expectRevert(
      instance.removeCharity.call(charity1, { from: charity2 }),
      'unauthorized',
    );
  });

  it.skip('allows only registered active charities to create and remove events', async () => {
    const activeCharity = charity1;
    const removedCharity = charity2;
    await instance.registerCharity(activeCharity);
    await instance.registerCharity(removedCharity);
    await instance.removeCharity(removedCharity);
    await instance.registerEvent.call('title', Math.floor(Date.now() / 1000), { from: activeCharity });
    const event = await instance.events.call(0);

    assert.equal(
      event.title,
      'title',
      'active charity cannot register events'
    );

    await expectRevert(
      instance.registerEvent('title'),
      'unauthorized',
    );

    await expectRevert(
      instance.registerEvent.call('title', { from: removedCharity }),
      'unauthorized',
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
    const result = await instance.getCharities.call({ from: charity2 });

    assert.equal(
      result[0],
      charity1,
      'charities could not be properly read'
    );
  });
});
