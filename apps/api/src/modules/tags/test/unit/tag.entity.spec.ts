import { Tag } from '../../domain/entities/tag.entity'

describe('Tags Domain Entity', () => {
  it('should create and format tag with color and json representation', () => {
    const tag = Tag.create({
      id: 'tag-1',
      tenantId: 'tenant-1',
      name: 'High Priority Prospect',
      color: '#E53E3E',
      createdAt: new Date(),
    })

    expect(tag.id).toBe('tag-1')
    expect(tag.name).toBe('High Priority Prospect')
    expect(tag.color).toBe('#E53E3E')

    const json = tag.toJSON()
    expect(json.name).toBe('High Priority Prospect')
    expect(json.color).toBe('#E53E3E')
  })
})
