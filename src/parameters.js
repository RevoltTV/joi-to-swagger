import _ from 'lodash'

import parser from './parser'
import getSchema from './schema'

export function getBodyParameter (schema) {
  let body = {}

  if (schema.isJoi) {
    body.schema = getSchema(schema)
  } else {
    _.each(schema, (property, name) => {
      _.merge(body, getParameterObject(property, name, 'body'))
    })
  }

  body.schema.required = _.reduce(body.schema.properties, (required, prop, key) => {
    if (prop.required) {
      required.push(key)
    }

    return required
  }, [])

  body.name = 'body'

  return body
}

export function getParameterObject (schema, name, parameterLocation) {
  let param = {
    name,
    in: parameterLocation
  }

  switch (parameterLocation) {
    case 'body':
      param.schema = {
        type: 'object',
        properties: {
          [name]: parser(schema)
        }
      }

      break
    default:
      param = _.extend({}, param, parser(schema))
      break
  }

  return param
}
