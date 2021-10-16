const Events = artifacts.require('Events');
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('Events', async accounts => {
  const [contractOwner, charity1, charity2] = accounts;

  beforeEach(async () => {
    instance = await Events.new();
  });

  it('allows only the owner to add charities', async () => {
    assert.equal(
      contractOwner,
      await instance.owner(),
      'the owner is not properly assigned',
    );

    await instance.registerCharity(charity1);
    assert.equal(
      await instance.charities([0]),
      charity1,
      'the owner cannot register charities'
    )

    await expectRevert(
      instance.registerCharity.call(charity1, { from: charity1 }),
      'Ownable: caller is not the owner',
    );
  });
});
