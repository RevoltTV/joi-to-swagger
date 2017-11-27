import _ from 'lodash'

import parser from './parser'

export default function parseSchema (schema) {
  let result = {}
  if (schema._type === 'object') {
    result.type = 'object'
    result.description = schema._description || ''
    result.properties = {}
    result.required = []
    _.each(schema._inner.children, (property) => {
      let param = result.properties[property.key] = parser(property.schema)
      if (param.required) {
        result.required.push(property.key)
        delete param.required
      }
    })
  } else if (schema._type === 'array') {
    result.type = 'array'
    result.description = schema._description || ''
    result.items = parseSchema(schema._inner.items[0])
  } else if (_.isObject(schema) && !schema._type) {
    result.type = 'object'
    result.description = schema._description || ''
    result.properties = _.mapValues(schema, (value) => {
      if (_.isArray(value)) {
        return {
          type: 'array',
          items: parseSchema(value[0])
        }
      }

      return parser(value)
    })
  } else {
    return parser(schema)
  }

  return result
}
