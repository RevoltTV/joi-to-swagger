import _ from 'lodash'

import parseSchema from './schema'

export default function parser (schema) {
  let param = {}

    // Adjust based on what the type is of the parameter
  switch (schema._type) {
    case 'any':
      param.type = 'string'
      break
    case 'array':
      param = parseSchema(schema)
      break
    case 'object':
      param = parseSchema(schema)
      break
    case 'date':
      param.type = 'string'
      param.format = 'date-time'
      break
    case 'alternatives':
      schema = schema._inner.matches[schema._inner.matches.length - 1].schema
      param = parseSchema(schema)
      break
    default: // By default, just assign the schema type to the parameter type
      param.type = schema._type
      break
  }

    // Handle common flags and keys
  if (schema._name) param.name = schema._name
  if (schema._summary) param.summary = schema._summary
  if (schema._description) param.description = schema._description
  param.required = _.get(schema, '_flags.presence') === 'required'
  if (!param.required) delete param.required

    // Only allow string and number defaults (no functions or complex objects)
  if (_.get(schema, '_flags.default') &&
        (typeof schema._flags.default === 'string' ||
        typeof schema._flags.default === 'number')) {
    param.default = schema._flags.default
  }

  if (schema._examples && schema._examples.length) {
    param.example = schema._examples[0]
  }

    // Determine additional properties based on tests
  _.each(schema._tests, (test) => {
    switch (test.name) {
      case 'isoDate':
        param.example = new Date().toISOString()
        break
      case 'email':
        param.format = 'email'
        break
      case 'guid':
        param.format = 'uuid'
        break
      case 'integer':
        param.type = 'integer'
        break
      case 'max':
        param.maximum = test.arg
        break
      case 'min':
        param.minimum = test.arg
        break
      case 'uri':
        param.format = 'url'
        break
    }
  })

  if (_.get(schema, '_valids._set.length', 0) > 0 && _.compact(schema._valids._set).length > 0) {
    param.enum = schema._valids._set.filter(Boolean)
  }

  return param
}
