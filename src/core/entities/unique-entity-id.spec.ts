import { UniqueEntityID } from './unique-entity-id';

describe('EntityId Test', () => {
  it('should be able to create a new EntityId', async () => {
    const newEntityId = new UniqueEntityID();

    expect(newEntityId).toBeInstanceOf(UniqueEntityID);
  });

  it('should  be able to create a new EntityId with specified id', async () => {
    const newObjectId = new UniqueEntityID('id-test');

    expect(newObjectId.toValue()).toEqual('id-test');
  });
});
